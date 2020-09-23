import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";


export class NetworkStack extends cdk.Stack {
	readonly vpc: ec2.Vpc;
	readonly cluster: ecs.Cluster;
	readonly namespace = "teastore";

	constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		this.vpc = new ec2.Vpc(this, "Vpc", {});
		this.cluster = new ecs.Cluster(this, "Cluster", {
			vpc: this.vpc,
			defaultCloudMapNamespace: {
				name: this.namespace
			}
		});
	}
}
