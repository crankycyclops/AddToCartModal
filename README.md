A Magento 2 module that will prompt the user after adding an item to their cart with information about the item and a choice to either proceeed to checkout or continue shopping. Supports configurable options with variable pricing.

To install:

```
mkdir -p /path/to/store/thirdparty/Crankycyclops
cd /path/to/store/thirdparty/Crankycyclops
git clone git@github.com:crankycyclops/AddToCartModal.git
ln -s /path/to/store/app/code/Crankycyclops /path/to/store/thirdparty/Crankycyclops
php bin/magento module:enable Crankycyclops_AddToCartModal
php bin/magento setup:upgrade
```

Make sure to clear your cache, and also to run di:compile if you're in production mode.

TODO: composer package coming soon!
