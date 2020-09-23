import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2";
import {Component} from "./component";
import {NetworkStack} from "./network-stack";
import {PersistenceStack} from "./persistence-stack";
import {RegistryStack} from "./registry-stack";
import {ImageStack} from "./image-stack";
import {RecommenderStack} from "./recommender-stack";
import {AuthStack} from "./auth-stack";
import {SharedSecurityGroupsStack} from "./shared-sgs-stack";


export class WebUiStack extends cdk.Stack {
	constructor(scope: cdk.Construct, id: string,
				network: NetworkStack, sharedSgs: SharedSecurityGroupsStack, persistence: PersistenceStack, registry: RegistryStack,
				auth: AuthStack, image: ImageStack, recommender: RecommenderStack, props?: cdk.StackProps) {
		super(scope, id, props);

		const webuiInternalPort = 8080;
		const webuiPublicPort = 80;
		const webui = new Component(this, "WebUi", {
			cluster: network.cluster,
			taskProps: {
				cpu: 1024,
				memoryLimitMiB: 2048
			},
			containerProps: {
				image: ecs.ContainerImage.fromRegistry("descartesresearch/teastore-webui"),
				environment: {
					USE_POD_IP: "true",
					REGISTRY_HOST: [registry.name, network.namespace].join(".")
				}
			},
			ports: [ec2.Port.tcp(webuiInternalPort)],
			securityGroup: // Indirect access of security group to prevent LBListener mutating them
				ec2.SecurityGroup.fromSecurityGroupId(this, "SharedSecurityGroup", sharedSgs.webui.securityGroupId, {mutable: false}),
			maxCapacity: 5
		});

		const loadBalancer = new elbv2.ApplicationLoadBalancer(this, "WebUiLoadBalancer", {
			vpc: network.vpc,
			vpcSubnets: {subnetType: ec2.SubnetType.PUBLIC},
			internetFacing: true
		})
		loadBalancer.addListener("LoadBalancerListener", {
			port: webuiPublicPort,
			defaultTargetGroups: [new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
				vpc: network.vpc,
				port: webuiInternalPort,
				targets: [webui.service],
				healthCheck: {
					path: "/tools.descartes.teastore.webui/",
					port: webuiInternalPort.toString()
				}
			})]
		});
	}
}
