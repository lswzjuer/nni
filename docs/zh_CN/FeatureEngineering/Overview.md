# 特征工程

我们很高兴的宣布，基于 NNI 的特征工程工具发布了 Alpha 版本。该版本仍处于试验阶段，根据使用反馈会进行改进。 诚挚邀请您使用、反馈，或更多贡献。

当前支持以下特征选择器：
- [GradientFeatureSelector](./GradientFeatureSelector.md)
- [GBDTSelector](./GBDTSelector.md)


# 如何使用

```python
from nni.feature_engineering.gradient_selector import GradientFeatureSelector
# from nni.feature_engineering.gbdt_selector import GBDTSelector

# 读取数据
...
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=42)

# 初始化 Selector
fgs = GradientFeatureSelector(...)
# 拟合数据
fgs.fit(X_train, y_train)
# 获取重要的特征
# 此处会返回重要特征的索引。
print(fgs.get_selected_features(...))

...
```

使用内置 Selector 时，需要 `import` 对应的特征选择器，并 `initialize`。 可在 Selector 中调用 `fit` 函数来传入数据。 之后，可通过 `get_seleteced_features` 来获得重要的特征。 不同 Selector 的函数参数可能不同，在使用前需要先检查文档。

# 如何定制

NNI 内置了_最先进的_特征工程算法的 Selector。 NNI 也支持定制自己的特征 Selector。

如果要实现定制的特征 Selector，需要：

1. 继承基类 FeatureSelector
1. 实现 _fit_ 和 _get_selected_features_ 函数
1. 与 sklearn 集成 (可选)

示例如下：

**1. 继承基类 FeatureSelector**

```python
from nni.feature_engineering.feature_selector import FeatureSelector

class CustomizedSelector(FeatureSelector):
    def __init__(self, ...):
    ...
```

**2. 实现 _fit_ 和 _get_selected_features_ 函数**

```python
from nni.tuner import Tuner

from nni.feature_engineering.feature_selector import FeatureSelector

class CustomizedSelector(FeatureSelector):
    def __init__(self, ...):
    ...

    def fit(self, X, y, **kwargs):
        """
        将数据拟合到 FeatureSelector

        参数
        ------------
        X : numpy 矩阵
        训练输入样本，形状为 [n_samples, n_features]。
        y: numpy 矩阵
        目标值 (分类中的类标签，回归中为实数)。 形状是 [n_samples]。
        """
        self.X = X
        self.y = y
        ...

    def get_selected_features(self):
        """
        获取重要特征

        Returns
        -------
        list :
        返回重要特征的索引。
        """
        ...
        return self.selected_features_

    ...
```

**3. 与 sklearn 集成**

`sklearn.pipeline.Pipeline` 可将模型连接在一起，例如特征选择，规范化，以及分类、回归，来组成一个典型的机器学习问题工作流。 下列步骤可帮助集成 sklearn，将定制的特征 Selector 作为管道的模块。

1. 继承类 _sklearn.base.BaseEstimator_
1. 实现 _BaseEstimator_ 中的 _get_params_ 和 _set_params_ 函数
1. 继承类 _sklearn.feature_selection.base.SelectorMixin_
1. 实现 _SelectorMixin_ 中的 _get_support_, _transform_ 和 _inverse_transform_ 函数

示例如下：

**1. 继承类 BaseEstimator 及其函数**

```python
from sklearn.base import BaseEstimator
from nni.feature_engineering.feature_selector import FeatureSelector

class CustomizedSelector(FeatureSelector, BaseEstimator):
    def __init__(self, ...):
    ...

    def get_params(self, ...):
        """
        为此 estimator 获取参数
        """
        params = self.__dict__
        params = {key: val for (key, val) in params.items()
        if not key.endswith('_')}
        return params

    def set_params(self, **params):
        """
        为此 estimator 设置参数
        """
        for param in params:
        if hasattr(self, param):
        setattr(self, param, params[param])
        return self

```

**2. 继承 SelectorMixin 类及其函数**
```python
from sklearn.base import BaseEstimator
from sklearn.feature_selection.base import SelectorMixin

from nni.feature_engineering.feature_selector import FeatureSelector

class CustomizedSelector(FeatureSelector, BaseEstimator):
    def __init__(self, ...):
        ...

    def get_params(self, ...):
        """
        获取参数。
        """
        params = self.__dict__
        params = {key: val for (key, val) in params.items()
        if not key.endswith('_')}
        return params

        def set_params(self, **params):
        """
        设置参数
        """
        for param in params:
        if hasattr(self, param):
        setattr(self, param, params[param])
        return self

    def get_support(self, indices=False):
        """
        获取 mask，整数索引或选择的特征。

        Parameters
        ----------
        indices : bool
        默认为 False. 如果为 True，返回值为整数数组，否则为布尔的 mask。

        Returns
        -------
        list :
        返回 support: 从特征向量中选择保留的特征索引。
        如果 indices 为 False，布尔数据的形状为 [输入特征的数量]，如果元素为 True，表示保留相对应的特征。
        如果 indices 为 True，整数数组的形状为 [输出特征的数量]，值表示
        输入特征向量中的索引。
        """
        ...
        return mask


    def transform(self, X):
        """将 X 减少为选择的特征。

        Parameters
        ----------
        X : array
        形状为 [n_samples, n_features]

        Returns
        -------
        X_r : array
        形状为 [n_samples, n_selected_features]
        仅输入选择的特征。
        """
        ...
        return X_r


    def inverse_transform(self, X):
        """
        反转变换操作

        Parameters
        ----------
        X : array
        形状为 [n_samples, n_selected_features]

        Returns
        -------
        X_r : array
        形状为 [n_samples, n_original_features]
        """
        ...
        return X_r
```

与 sklearn 继承后，可如下使用特征 Selector：
```python
from sklearn.linear_model import LogisticRegression

# 加载数据
...
X_train, y_train = ...

# 构造 pipeline
pipeline = make_pipeline(XXXSelector(...), LogisticRegression())
pipeline = make_pipeline(SelectFromModel(ExtraTreesClassifier(n_estimators=50)), LogisticRegression())
pipeline.fit(X_train, y_train)

# 分数
print("Pipeline Score: ", pipeline.score(X_train, y_train))

```

# 基准测试

`Baseline` 表示没有进行特征选择，直接将数据传入 LogisticRegression。 此基准测试中，仅用了 10% 的训练数据作为测试数据。

| 数据集           | Baseline | GradientFeatureSelector | TreeBasedClassifier | 训练次数       | 特征数量      |
| ------------- | -------- | ----------------------- | ------------------- | ---------- | --------- |
| colon-cancer  | 0.7547   | 0.7368                  | 0.7223              | 62         | 2,000     |
| gisette       | 0.9725   | 0.89416                 | 0.9792              | 6,000      | 5,000     |
| avazu         | 0.8834   | N/A                     | N/A                 | 40,428,967 | 1,000,000 |
| rcv1          | 0.9644   | 0.7333                  | 0.9615              | 20,242     | 47,236    |
| news20.binary | 0.9208   | 0.6870                  | 0.9070              | 19,996     | 1,355,191 |
| real-sim      | 0.9681   | 0.7969                  | 0.9591              | 72,309     | 20,958    |

此基准测试可在[这里](https://www.csie.ntu.edu.tw/~cjlin/libsvmtools/datasets/)下载

