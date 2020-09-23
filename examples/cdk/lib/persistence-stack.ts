import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import {Component} from "./component";
import {NetworkStack} from "./network-stack";
import {RegistryStack} from "./registry-stack";
import {DbStack} from "./db-stack";
import {SharedSecurityGroupsStack} from "./shared-sgs-stack";


export class PersistenceStack extends cdk.Stack {
	constructor(scope: cdk.Construct, id: string,
				network: NetworkStack, sharedSgs: SharedSecurityGroupsStack, registry: RegistryStack, db: DbStack,
				props?: cdk.StackProps) {
		super(scope, id, props);

		new Component(this, "Persistence", {
			cluster: network.cluster,
			taskProps: {
				cpu: 512,
				memoryLimitMiB: 1024
			},
			containerProps: {
				image: ecs.ContainerImage.fromRegistry("descartesresearch/teastore-persistence"),
				environment: {
					USE_POD_IP: "true",
					REGISTRY_HOST: [registry.name, network.namespace].join("."),
					DB_HOST: [db.name, network.namespace].join("."),
					DB_PORT: db.port.toString()
				}
			},
			ports: [ec2.Port.tcp(8080)],
			securityGroup: sharedSgs.persistence,
			ingress: [sharedSgs.webui, sharedSgs.auth, sharedSgs.image, sharedSgs.recommender],
			maxCapacity: 5
		});
	}
}
