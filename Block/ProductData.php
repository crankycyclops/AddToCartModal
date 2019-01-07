<?php
/**
 * @category  Crankycyclops
 * @package   Crankycyclops_AddToCartModal
 * @author    James Colannino
 * @copyright Copyright (c) 2018 James Colannino
 * @license   https://opensource.org/licenses/OSL-3.0 OSL v3
 */

namespace Crankycyclops\AddToCartModal\Block;

class ProductData extends \Magento\Framework\View\Element\Template {

	protected $product;
	protected $configurableProductTypeModel;
	protected $storeInterface;

	/*************************************************************************/

	public function __construct(
		\Magento\Framework\View\Element\Template\Context $context,
		array $data,
		\Magento\Framework\Registry $registry,
		\Magento\Store\Model\StoreManagerInterface $storeInterface,
		\Magento\ConfigurableProduct\Model\Product\Type\Configurable $configurableProductTypeModel
	) {
		$this->product = $registry->registry('current_product');
		$this->configurableProductTypeModel = $configurableProductTypeModel;
		$this->storeInterface = $storeInterface;
		parent::__construct($context, $data);
	}

	/*************************************************************************/

	protected function getProductDetails($product = false) {

		if (!$product) {
			$product = $this->product;
		}

		$imageUrl = false;
		$imageUri = $product->getImage();
		if ($imageUri) {
			$imageUrl = $this->storeInterface->getStore()->getBaseUrl(\Magento\Framework\UrlInterface::URL_TYPE_MEDIA) .'catalog/product'. $imageUri;
		}

		return [
			'id'           => $product->getId(),
			'sku'          => $product->getSku(),
			'price'        => $product->getFinalPrice(),
			'product_name' => $product->getName(),
			'image'        => $imageUrl
		];
	}

	/*************************************************************************/

	public function getProduct() {

		return $this->product;
	}

	/*************************************************************************/

	public function getProductDataJson() {

		$productArr = $this->getProductDetails();
		$productArr['options'] = [];

		if ('configurable' == $this->product->getTypeId()) {

			$typeInstance = $this->product->getTypeInstance();
			$childProducts = $typeInstance->getUsedProducts($this->product);
			$configurableAttributes = $typeInstance->getConfigurableAttributesAsArray($this->product);

			foreach ($configurableAttributes as $attribute_id => $attribute) {

				$productArr['options'][$attribute_id] = [
					'label'   => $attribute['store_label'],
					'options' => []
				];

				foreach ($attribute['options'] as $option) {

					$productArr['options'][$attribute_id]['options'][$option['value']] = [
						'label'   => $option['label']
					];

					$childProduct = $this->configurableProductTypeModel->getProductByAttributes([$attribute_id => $option['value']], $this->product);
					$productArr['options'][$attribute_id]['options'][$option['value']]['product'] = $this->getProductDetails($childProduct);
				}
			}
		}

		return json_encode($productArr);
	}
}

