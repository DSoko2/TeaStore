import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import {NetworkStack} from "./network-stack";


export class SharedSecurityGroupsStack extends cdk.Stack {
	readonly auth: ec2.ISecurityGroup;
	readonly db: ec2.ISecurityGroup;
	readonly image: ec2.ISecurityGroup;
	readonly persistence: ec2.ISecurityGroup;
	readonly recommender: ec2.ISecurityGroup;
	readonly registry: ec2.ISecurityGroup;
	readonly webui: ec2.ISecurityGroup;

	constructor(scope: cdk.Construct, id: string, network: NetworkStack, props?: cdk.StackProps) {
		super(scope, id, props);

		const sgProps = {
			allowAllOutbound: false,
			vpc: network.vpc
		};
		this.auth = new ec2.SecurityGroup(this, "Auth", sgProps);
		this.db = new ec2.SecurityGroup(this, "Db", sgProps);
		this.image = new ec2.SecurityGroup(this, "Image", sgProps);
		this.persistence = new ec2.SecurityGroup(this, "Persistence", sgProps);
		this.recommender = new ec2.SecurityGroup(this, "Recommender", sgProps);
		this.registry = new ec2.SecurityGroup(this, "Registry", sgProps);
		this.webui = new ec2.SecurityGroup(this, "WebUi", sgProps);
	}
}
