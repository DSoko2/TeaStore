import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import {Component} from "./component";
import {NetworkStack} from "./network-stack";
import {SharedSecurityGroupsStack} from "./shared-sgs-stack";

export class DbStack extends cdk.Stack {
	readonly name = "db";
	readonly port = ec2.Port.tcp(3306);

	constructor(scope: cdk.Construct, id: string, network: NetworkStack, sharedSgs: SharedSecurityGroupsStack,
				props?: cdk.StackProps) {
		super(scope, id, props);

		new Component(this, "Db", {
			cluster: network.cluster,
			taskProps: {
				cpu: 512,
				memoryLimitMiB: 1024
			},
			containerProps: {
				image: ecs.ContainerImage.fromRegistry("descartesresearch/teastore-db")
			},
			ports: [this.port],
			securityGroup: sharedSgs.db,
			ingress: [sharedSgs.persistence],
			cloudMapOptions: {name: this.name}
		});
	}
}
