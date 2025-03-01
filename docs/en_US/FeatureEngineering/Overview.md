# FeatureEngineering

We are glad to announce the alpha release for Feature Engineering toolkit on top of NNI, it's still in the experiment phase which might evolve based on user feedback. We'd like to invite you to use, feedback and even contribute.

For now, we support the following feature selector:
- [GradientFeatureSelector](./GradientFeatureSelector.md)
- [GBDTSelector](./GBDTSelector.md)


# How to use?

```python
from nni.feature_engineering.gradient_selector import GradientFeatureSelector
# from nni.feature_engineering.gbdt_selector import GBDTSelector

# load data
...
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=42)

# initlize a selector
fgs = GradientFeatureSelector(...)
# fit data
fgs.fit(X_train, y_train)
# get improtant features
# will return the index with important feature here.
print(fgs.get_selected_features(...))

...
```

When using the built-in Selector, you first need to `import` a feature selector, and `initialize` it. You could call the function `fit` in the selector to pass the data to the selector. After that, you could use `get_seleteced_features` to get important features. The function parameters in different selectors might be different, so you need to check the docs before using it. 

# How to customize?

NNI provides _state-of-the-art_ feature selector algorithm in the builtin-selector. NNI also supports to build a feature selector by yourself.

If you want to implement a customized feature selector, you need to:

1. Inherit the base FeatureSelector class
1. Implement _fit_ and _get_selected_features_ function
1. Integrate with sklearn (Optional)

Here is an example:

**1. Inherit the base Featureselector Class**

```python
from nni.feature_engineering.feature_selector import FeatureSelector

class CustomizedSelector(FeatureSelector):
    def __init__(self, ...):
    ...
```

**2. Implement _fit_ and _get_selected_features_ Function**

```python
from nni.tuner import Tuner

from nni.feature_engineering.feature_selector import FeatureSelector

class CustomizedSelector(FeatureSelector):
    def __init__(self, ...):
    ...

    def fit(self, X, y, **kwargs):
        """
        Fit the training data to FeatureSelector

        Parameters
        ------------
        X : array-like numpy matrix
        The training input samples, which shape is [n_samples, n_features].
        y: array-like numpy matrix
        The target values (class labels in classification, real numbers in regression). Which shape is [n_samples].
        """
        self.X = X
        self.y = y
        ...
    
    def get_selected_features(self):
        """
        Get important feature

        Returns
        -------
        list :
        Return the index of the important feature.
        """
        ...
        return self.selected_features_

    ...
```

**3. Integrate with Sklearn**

`sklearn.pipeline.Pipeline` can connect models in series, such as feature selector, normalization, and classification/regression to form a typical machine learning problem workflow. 
The following step could help us to better integrate with sklearn, which means we could treat the customized feature selector as a mudule of the pipeline.

1. Inherit the calss _sklearn.base.BaseEstimator_
1. Implement _get_params_ and _set_params_ function in _BaseEstimator_
1. Inherit the class _sklearn.feature_selection.base.SelectorMixin_
1. Implement _get_support_, _transform_ and _inverse_transform_ Function in _SelectorMixin_

Here is an example:

**1. Inherit the BaseEstimator Class and its Function**

```python
from sklearn.base import BaseEstimator
from nni.feature_engineering.feature_selector import FeatureSelector

class CustomizedSelector(FeatureSelector, BaseEstimator):
    def __init__(self, ...):
    ...
    
    def get_params(self, ...):
        """
        Get parameters for this estimator.
        """
        params = self.__dict__
        params = {key: val for (key, val) in params.items()
        if not key.endswith('_')}
        return params
    
    def set_params(self, **params):
        """
        Set the parameters of this estimator.
        """
        for param in params:
        if hasattr(self, param):
        setattr(self, param, params[param])
        return self

```

**2. Inherit the SelectorMixin Class and its Function**
```python
from sklearn.base import BaseEstimator
from sklearn.feature_selection.base import SelectorMixin

from nni.feature_engineering.feature_selector import FeatureSelector

class CustomizedSelector(FeatureSelector, BaseEstimator):
    def __init__(self, ...):
        ...
    
    def get_params(self, ...):
        """
        Get parameters for this estimator.
        """
        params = self.__dict__
        params = {key: val for (key, val) in params.items()
        if not key.endswith('_')}
        return params
        
        def set_params(self, **params):
        """
        Set the parameters of this estimator.
        """
        for param in params:
        if hasattr(self, param):
        setattr(self, param, params[param])
        return self

    def get_support(self, indices=False):
        """
        Get a mask, or integer index, of the features selected.

        Parameters
        ----------
        indices : bool
        Default False. If True, the return value will be an array of integers, rather than a boolean mask.

        Returns
        -------
        list :
        returns support: An index that selects the retained features from a feature vector.
        If indices are False, this is a boolean array of shape [# input features], in which an element is True iff its corresponding feature is selected for retention.
        If indices are True, this is an integer array of shape [# output features] whose values
        are indices into the input feature vector.
        """
        ...
        return mask
    

    def transform(self, X):
        """Reduce X to the selected features.

        Parameters
        ----------
        X : array
        which shape is [n_samples, n_features]

        Returns
        -------
        X_r : array
        which shape is [n_samples, n_selected_features]
        The input samples with only the selected features.
        """
        ...
        return X_r


    def inverse_transform(self, X):
        """
        Reverse the transformation operation

        Parameters
        ----------
        X : array
        shape is [n_samples, n_selected_features]

        Returns
        -------
        X_r : array
        shape is [n_samples, n_original_features]
        """
        ...
        return X_r
```

After integrating with Sklearn, we could use the feature selector as follows:
```python
from sklearn.linear_model import LogisticRegression

# load data
...
X_train, y_train = ...

# build a ppipeline
pipeline = make_pipeline(XXXSelector(...), LogisticRegression())
pipeline = make_pipeline(SelectFromModel(ExtraTreesClassifier(n_estimators=50)), LogisticRegression())
pipeline.fit(X_train, y_train)

# score
print("Pipeline Score: ", pipeline.score(X_train, y_train))

```

# Benchmark

`Baseline` means without any feature selection, we directly pass the data to LogisticRegression. For this benchmark, we only use 10% data from the train as test data.

| Dataset | Baseline | GradientFeatureSelector | TreeBasedClassifier | #Train | #Feature | 
| ----------- | ------ | ------ | ------- | ------- | -------- |
| colon-cancer | 0.7547 | 0.7368 | 0.7223 | 62 | 2,000 |
| gisette | 0.9725 | 0.89416 | 0.9792 | 6,000 | 5,000 |
| avazu | 0.8834 | N/A | N/A | 40,428,967 | 1,000,000 |
| rcv1 | 0.9644 | 0.7333 | 0.9615 | 20,242 | 47,236 |
| news20.binary | 0.9208 | 0.6870 | 0.9070 | 19,996 | 1,355,191 |
| real-sim | 0.9681 | 0.7969 | 0.9591 | 72,309 | 20,958 |

The benchmark could be download in [here](https://www.csie.ntu.edu.tw/~cjlin/libsvmtools/datasets/
)

