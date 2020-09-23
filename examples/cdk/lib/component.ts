import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";

export interface IComponentProps {
	cluster: ecs.Cluster,
	taskProps?: ecs.FargateTaskDefinitionProps,
	containerProps: ecs.ContainerDefinitionOptions,
	ports?: ec2.Port[],
	cloudMapOptions?: ecs.CloudMapOptions,
	minCapacity?: number,
	maxCapacity?: number,
	securityGroup?: ec2.ISecurityGroup,
	ingress?: ec2.IPeer[],
	targetCpuUtilizationPercent?: number
}

export class Component extends cdk.Construct {
	readonly service: ecs.FargateService;

	constructor(scope: cdk.Construct, id: string, props: IComponentProps) {
		super(scope, id);

		const task = new ecs.FargateTaskDefinition(this, "Task", props.taskProps);
		task.addContainer(id + "Container", props.containerProps)
			.addPortMappings(...props.ports
				?.map(port => {
					return {containerPort: Number(port)};
				}) || []);
		const componentSG: ec2.ISecurityGroup = new ec2.SecurityGroup(this, "InternalSecurityGroup", {
			allowAllOutbound: true,
			vpc: props.cluster.vpc
		});
		props.ingress?.map(peer =>
			props.ports?.map(port =>
				componentSG.addIngressRule(peer, port)));
		this.service = new ecs.FargateService(this, "Service", {
			cluster: props.cluster,
			taskDefinition: task,
			vpcSubnets: {subnetType: ec2.SubnetType.PRIVATE},
			cloudMapOptions: props.cloudMapOptions,
			securityGroups: [componentSG].concat(props.securityGroup || [])
		});
		if (props.maxCapacity && props.maxCapacity > 1) {
			const scalingConfig = this.service.autoScaleTaskCount({
				minCapacity: props.minCapacity, // defaults to 1
				maxCapacity: props.maxCapacity || 1
			});
			scalingConfig.scaleOnCpuUtilization("Scaling", {
				targetUtilizationPercent: props.targetCpuUtilizationPercent || 75
			});
		}
	}
}
