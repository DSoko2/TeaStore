#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {TeaStoreStack} from "../lib/teastore-stack";
import {NetworkStack} from "../lib/network-stack";
import {DbStack} from "../lib/db-stack";
import {RegistryStack} from "../lib/registry-stack";
import {PersistenceStack} from "../lib/persistence-stack";
import {AuthStack} from "../lib/auth-stack";
import {ImageStack} from "../lib/image-stack";
import {RecommenderStack} from "../lib/recommender-stack";
import {WebUiStack} from "../lib/webui-stack";
import {SharedSecurityGroupsStack} from "../lib/shared-sgs-stack";

const app = new cdk.App();

// Entire application as single nested stack
new TeaStoreStack(app, "TeaStore");

// TeaStore application as separate, dependent stacks
const network = new NetworkStack(app, "TSNetwork");
const sharedSgs = new SharedSecurityGroupsStack(app, "TSSharedSGs", network);
const registry = new RegistryStack(app, "TSRegistry", network, sharedSgs);
const db = new DbStack(app, "TSDb", network, sharedSgs);

const persistence = new PersistenceStack(app, "TSPersistence", network, sharedSgs, registry, db);
persistence.addDependency(db);
persistence.addDependency(registry);

const auth = new AuthStack(app, "TSAuth", network, sharedSgs, registry);
auth.addDependency(registry);
auth.addDependency(persistence);

const image = new ImageStack(app, "TSImage", network, sharedSgs, registry);
image.addDependency(registry);
image.addDependency(persistence);

const recommender = new RecommenderStack(app, "TSRecommender", network, sharedSgs, registry);
recommender.addDependency(registry);
recommender.addDependency(persistence);

const webui = new WebUiStack(app, "TSWebUi", network, sharedSgs, persistence, registry, auth, image, recommender);
webui.addDependency(registry);
webui.addDependency(persistence);
webui.addDependency(auth);
webui.addDependency(image);
webui.addDependency(recommender);
