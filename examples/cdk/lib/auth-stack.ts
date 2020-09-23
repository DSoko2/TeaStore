import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import {Component} from "./component";
import {NetworkStack} from "./network-stack";
import {RegistryStack} from "./registry-stack";
import {SharedSecurityGroupsStack} from "./shared-sgs-stack";


export class AuthStack extends cdk.Stack {
	constructor(scope: cdk.Construct, id: string,
				network: NetworkStack, sharedSgs: SharedSecurityGroupsStack, registry: RegistryStack, props?: cdk.StackProps) {
		super(scope, id, props);

		new Component(this, "Auth", {
			cluster: network.cluster,
			taskProps: {
				cpu: 512,
				memoryLimitMiB: 1024
			},
			containerProps: {
				image: ecs.ContainerImage.fromRegistry("descartesresearch/teastore-auth"),
				environment: {
					USE_POD_IP: "true",
					REGISTRY_HOST: [registry.name, network.namespace].join(".")
				}
			},
			ports: [ec2.Port.tcp(8080)],
			securityGroup: sharedSgs.auth,
			ingress: [sharedSgs.webui],
			maxCapacity: 5
		});
	}
}
