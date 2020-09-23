import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import {Component} from "./component";
import {NetworkStack} from "./network-stack";
import {SharedSecurityGroupsStack} from "./shared-sgs-stack";


export class RegistryStack extends cdk.Stack {
	readonly name = "registry";

	constructor(scope: cdk.Construct, id: string, network: NetworkStack, sharedSgs: SharedSecurityGroupsStack,
				props?: cdk.StackProps) {
		super(scope, id, props);

		new Component(this, "Registry", {
			cluster: network.cluster,
			taskProps: {
				cpu: 512,
				memoryLimitMiB: 1024
			},
			containerProps: {
				image: ecs.ContainerImage.fromRegistry("descartesresearch/teastore-registry")
			},
			ports: [ec2.Port.tcp(8080)],
			securityGroup: sharedSgs.registry,
			ingress: [sharedSgs.webui, sharedSgs.auth, sharedSgs.image, sharedSgs.persistence, sharedSgs.recommender],
			cloudMapOptions: {name: this.name}
		});
	}
}
