// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

'use strict';

import * as fs from 'fs';
import { GeneralK8sClient, KubernetesCRDClient } from '../kubernetesApiClient';
import { KubeflowOperator } from './kubeflowConfig';

/**
 * KubeflowOperator Client
 */
abstract class KubeflowOperatorClient extends KubernetesCRDClient {
    /**
     * Factory method to generate operator client
     */
    // tslint:disable-next-line:function-name
    public static generateOperatorClient(kubeflowOperator: KubeflowOperator,
                                         operatorApiVersion: string): KubernetesCRDClient {
        switch (kubeflowOperator) {
            case 'tf-operator': {
                switch (operatorApiVersion) {
                    case 'v1alpha2': {
                        return new TFOperatorClientV1Alpha2();
                    }
                    case 'v1beta1': {
                        return new TFOperatorClientV1Beta1();
                    }
                    case 'v1beta2': {
                        return new TFOperatorClientV1Beta2();
                    }
                    default:
                        throw new Error(`Invalid tf-operator apiVersion ${operatorApiVersion}`);
                }
            }
            case 'pytorch-operator': {
                switch (operatorApiVersion) {
                    case 'v1alpha2': {
                        return new PyTorchOperatorClientV1Alpha2();
                    }
                    case 'v1beta1': {
                        return new PyTorchOperatorClientV1Beta1();
                    }
                    case 'v1beta2': {
                        return new PyTorchOperatorClientV1Beta2();
                    }
                    default:
                        throw new Error(`Invalid pytorch-operator apiVersion ${operatorApiVersion}`);
                }
            }
            default:
                throw new Error(`Invalid operator ${kubeflowOperator}`);
        }
    }
}

// tslint:disable: no-unsafe-any no-any completed-docs
class TFOperatorClientV1Alpha2 extends KubeflowOperatorClient {
    /**
     * constructor, to initialize tfjob CRD definition
     */
    public constructor() {
        super();
        this.crdSchema = JSON.parse(fs.readFileSync('./config/kubeflow/tfjob-crd-v1alpha2.json', 'utf8'));
        this.client.addCustomResourceDefinition(this.crdSchema);
    }

    protected get operator(): any {
        return this.client.apis['kubeflow.org'].v1alpha2.namespaces('default').tfjobs;
    }

    public get containerName(): string {
        return 'tensorflow';
    }
}

class TFOperatorClientV1Beta1 extends KubernetesCRDClient {
    /**
     * constructor, to initialize tfjob CRD definition
     */
    public constructor() {
        super();
        this.crdSchema = JSON.parse(fs.readFileSync('./config/kubeflow/tfjob-crd-v1beta1.json', 'utf8'));
        this.client.addCustomResourceDefinition(this.crdSchema);
    }

    protected get operator(): any {
        return this.client.apis['kubeflow.org'].v1beta1.namespaces('default').tfjobs;
    }

    public get containerName(): string {
        return 'tensorflow';
    }
}

class TFOperatorClientV1Beta2 extends KubernetesCRDClient {
    /**
     * constructor, to initialize tfjob CRD definition
     */
    public constructor() {
        super();
        this.crdSchema = JSON.parse(fs.readFileSync('./config/kubeflow/tfjob-crd-v1beta2.json', 'utf8'));
        this.client.addCustomResourceDefinition(this.crdSchema);
    }

    protected get operator(): any {
        return this.client.apis['kubeflow.org'].v1beta2.namespaces('default').tfjobs;
    }

    public get containerName(): string {
        return 'tensorflow';
    }
}

class PyTorchOperatorClientV1Alpha2 extends KubeflowOperatorClient {
    /**
     * constructor, to initialize tfjob CRD definition
     */
    public constructor() {
        super();
        this.crdSchema = JSON.parse(fs.readFileSync('./config/kubeflow/pytorchjob-crd-v1alpha2.json', 'utf8'));
        this.client.addCustomResourceDefinition(this.crdSchema);
    }

    protected get operator(): any {
        return this.client.apis['kubeflow.org'].v1alpha2.namespaces('default').pytorchjobs;
    }

    public get containerName(): string {
        return 'pytorch';
    }
}

class PyTorchOperatorClientV1Beta1 extends KubernetesCRDClient {
    /**
     * constructor, to initialize tfjob CRD definition
     */
    public constructor() {
        super();
        this.crdSchema = JSON.parse(fs.readFileSync('./config/kubeflow/pytorchjob-crd-v1beta1.json', 'utf8'));
        this.client.addCustomResourceDefinition(this.crdSchema);
    }

    protected get operator(): any {
        return this.client.apis['kubeflow.org'].v1beta1.namespaces('default').pytorchjobs;
    }

    public get containerName(): string {
        return 'pytorch';
    }
}

class PyTorchOperatorClientV1Beta2 extends KubernetesCRDClient {
    /**
     * constructor, to initialize tfjob CRD definition
     */
    public constructor() {
        super();
        this.crdSchema = JSON.parse(fs.readFileSync('./config/kubeflow/pytorchjob-crd-v1beta2.json', 'utf8'));
        this.client.addCustomResourceDefinition(this.crdSchema);
    }

    protected get operator(): any {
        return this.client.apis['kubeflow.org'].v1beta2.namespaces('default').pytorchjobs;
    }

    public get containerName(): string {
        return 'pytorch';
    }
}

// tslint:enable: no-unsafe-any
export { KubeflowOperatorClient, GeneralK8sClient };
