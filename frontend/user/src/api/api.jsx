// const BASE_URL = 'http://187.127.149.81'
// export const BASE_URL = 'http://192.168.1.41:8000';
export const BASE_URL = "http://187.127.149.81"
export const RAZORPAY_KEY = "rzp_test_oZWpPCp1BkgtEg";


export const updateUserProfile = `${BASE_URL}/api/user/profile/update/`
export const userAddress = `${BASE_URL}/api/user/addresses/`
export const userAddressUpdate = `${BASE_URL}/api/user/addresses/`
export const getProductApi = `${BASE_URL}/api/product/categories/`
export const getProductVarients = (product_id) => `${BASE_URL}/api/user/products/${product_id}/variants/`
export const getProductDetailApi = `${BASE_URL}/api/user/products`
export const addProductApi = `${BASE_URL}/api/user/cart/`
export const productUpdateAoi = `${BASE_URL}/api/user/cart/`
export const getUserCartApi = `${BASE_URL}/api/user/cart/`
export const deleteUserCartApi = `${BASE_URL}/api/user/cart/`
export const deleteCartItemApi = (id) => `${BASE_URL}/api/user/cart/${id}/`
export const paymentCreateApi = `${BASE_URL}/api/user/payments/initiate/`
export const paymentVerifyApi = `${BASE_URL}/api/user/payments/verify/`
export const geocodeAddressApi = `${BASE_URL}/api/address/geocode/`;
export const reverseGeocodeApi = `${BASE_URL}/api/address/reverse-geocode/`;
export const saveAddressApi = `${BASE_URL}/api/address/save/`;
export const listAddressesApi = `${BASE_URL}/api/address/list/`;
export const orderCreateApi = `${BASE_URL}/api/user/orders/`;
export const orderListApi = `${BASE_URL}/api/user/orders/list/`;
export const orderCancelApi = (order_id) => `${BASE_URL}/api/user/orders/${order_id}/cancel/`;
export const orderDetailApi = (order_id) => `${BASE_URL}/api/user/orders/${order_id}/`;



