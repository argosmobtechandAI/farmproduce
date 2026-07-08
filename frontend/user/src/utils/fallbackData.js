import dummyProducts from './dummyProducts.json';

export const fallbackCategories = [
    { id: 1, name: 'Vegetables & Fruits', category_type: 'vegetable', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&fit=crop' },
    { id: 2, name: 'Atta, Rice & Dal', category_type: 'grocery', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&fit=crop' },
    { id: 3, name: 'Oil, Ghee & Masala', category_type: 'grocery', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=200&fit=crop' },
    { id: 4, name: 'Dairy, Bread & Eggs', category_type: 'grocery', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&fit=crop' },
    { id: 5, name: 'Bakery & Biscuits', category_type: 'grocery', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&fit=crop' },
    { id: 6, name: 'Dry Fruits & Cereals', category_type: 'grocery', image: 'https://images.unsplash.com/photo-1596151163158-b63309a473b9?w=200&fit=crop' },
    { id: 7, name: 'Chicken, Meat & Fish', category_type: 'grocery', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200&fit=crop' },
    { id: 8, name: 'Kitchenware & Appliances', category_type: 'grocery', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200&fit=crop' },
    { id: 9, name: 'Chips & Namkeen', category_type: 'grocery', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&fit=crop' },
    { id: 10, name: 'Sweets & Chocolates', category_type: 'grocery', image: 'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=200&fit=crop' },
    { id: 11, name: 'Drinks & Juices', category_type: 'grocery', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&fit=crop' },
    { id: 12, name: 'Tea, Coffee & Milk Drinks', category_type: 'grocery', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&fit=crop' },
];

// Real product images mapped by category
const categoryProductImages = {
    'Vegetables & Fruits': [
        'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?w=400&fit=crop', // potato
        'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&fit=crop', // onion
        'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=400&fit=crop', // tomato
        'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&fit=crop', // coriander
        'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400&fit=crop', // ginger
        'https://images.unsplash.com/photo-1579591919791-0e4d7e1bb4e3?w=400&fit=crop', // garlic
        'https://images.unsplash.com/photo-1590502160462-58b41354f588?w=400&fit=crop', // lemon
        'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400&fit=crop', // banana
        'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&fit=crop', // apple
        'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&fit=crop', // spinach
    ],
    'Atta, Rice & Dal': [
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&fit=crop', // atta
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&fit=crop', // rice
        'https://images.unsplash.com/photo-1511424187010-20a98f7b0c5f?w=400&fit=crop', // dal
        'https://images.unsplash.com/photo-1511424187010-20a98f7b0c5f?w=400&fit=crop',
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&fit=crop',
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&fit=crop',
        'https://images.unsplash.com/photo-1511424187010-20a98f7b0c5f?w=400&fit=crop',
        'https://images.unsplash.com/photo-1511424187010-20a98f7b0c5f?w=400&fit=crop',
        'https://images.unsplash.com/photo-1511424187010-20a98f7b0c5f?w=400&fit=crop',
    ],
    'Oil, Ghee & Masala': [
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&fit=crop', // ghee
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&fit=crop', // oil
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&fit=crop',
        'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&fit=crop', // turmeric
        'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&fit=crop', // chili
        'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&fit=crop',
        'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&fit=crop',
    ],
    'Dairy, Bread & Eggs': [
        'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&fit=crop', // milk
        'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&fit=crop', // butter
        'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&fit=crop', // paneer
        'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&fit=crop', // curd
        'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400&fit=crop', // bread
        'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400&fit=crop', // bread
        'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&fit=crop', // cheese
        'https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=400&fit=crop', // eggs
        'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&fit=crop',
    ],
    'Bakery & Biscuits': [
        'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&fit=crop',
        'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&fit=crop',
        'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&fit=crop',
        'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&fit=crop',
        'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&fit=crop',
        'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&fit=crop',
        'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&fit=crop',
        'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&fit=crop',
    ],
    'Dry Fruits & Cereals': [
        'https://images.unsplash.com/photo-1596151163158-b63309a473b9?w=400&fit=crop',
        'https://images.unsplash.com/photo-1563412580953-e3ab9d07a406?w=400&fit=crop',
        'https://images.unsplash.com/photo-1596151163158-b63309a473b9?w=400&fit=crop',
        'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&fit=crop', // cereal
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&fit=crop', // oats
        'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&fit=crop',
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&fit=crop',
        'https://images.unsplash.com/photo-1563412580953-e3ab9d07a406?w=400&fit=crop', // walnuts
    ],
    'Chicken, Meat & Fish': [
        'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&fit=crop',
        'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&fit=crop',
        'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&fit=crop',
        'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&fit=crop',
        'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&fit=crop', // mutton
        'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400&fit=crop', // fish
        'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&fit=crop',
        'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&fit=crop',
    ],
    'Kitchenware & Appliances': [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&fit=crop',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&fit=crop',
        'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&fit=crop',
        'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&fit=crop',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&fit=crop',
        'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&fit=crop',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&fit=crop',
        'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&fit=crop',
    ],
    'Chips & Namkeen': [
        'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&fit=crop',
        'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400&fit=crop',
        'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&fit=crop',
        'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400&fit=crop',
        'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&fit=crop',
        'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400&fit=crop',
        'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&fit=crop',
        'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400&fit=crop',
    ],
    'Sweets & Chocolates': [
        'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=400&fit=crop',
        'https://images.unsplash.com/photo-1605790994972-4ce1aa75e54c?w=400&fit=crop',
        'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=400&fit=crop',
        'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=400&fit=crop', // gulab jamun
        'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=400&fit=crop',
        'https://images.unsplash.com/photo-1608197492673-0d8e4f71a7f1?w=400&fit=crop', // ferrero
        'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=400&fit=crop',
        'https://images.unsplash.com/photo-1605790994972-4ce1aa75e54c?w=400&fit=crop',
    ],
    'Drinks & Juices': [
        'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&fit=crop', // cola
        'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&fit=crop',
        'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=400&fit=crop', // juice
        'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=400&fit=crop',
        'https://images.unsplash.com/photo-1551025943-d9cf7a1937fb?w=400&fit=crop', // energy
        'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&fit=crop',
        'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=400&fit=crop',
        'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&fit=crop',
    ],
    'Tea, Coffee & Milk Drinks': [
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&fit=crop', // coffee
        'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=400&fit=crop',   // tea
        'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=400&fit=crop',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&fit=crop',
        'https://images.unsplash.com/photo-1582684701006-b1f8c55cb3e4?w=400&fit=crop', // horlicks
        'https://images.unsplash.com/photo-1582684701006-b1f8c55cb3e4?w=400&fit=crop', // bournvita
        'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=400&fit=crop',
        'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=400&fit=crop',
    ],
};

// Track index per category for rotating images
const categoryIndexCounters = {};

export const getMappedProducts = () => {
    // Reset counters
    Object.keys(categoryIndexCounters).forEach(k => delete categoryIndexCounters[k]);

    return dummyProducts.map(item => {
        const cat = fallbackCategories.find(c => c.name === item.category) || fallbackCategories[0];

        // Get a rotating product image from the category pool
        if (!categoryIndexCounters[cat.name]) categoryIndexCounters[cat.name] = 0;
        const imgPool = categoryProductImages[cat.name] || categoryProductImages['Vegetables & Fruits'];
        const imgIdx = categoryIndexCounters[cat.name] % imgPool.length;
        const productImage = imgPool[imgIdx];
        categoryIndexCounters[cat.name]++;

        return {
            id: item.id,
            name: item.name,
            category: {
                id: cat.id,
                name: cat.name,
                category_type: cat.category_type,
                image: cat.image,
            },
            image: productImage,
            variants: [
                {
                    id: item.id * 100,
                    price: item.discountPrice || item.price,
                    unit: item.unit,
                }
            ],
            inStock: item.inStock,
            rating: item.rating,
            brand: item.brand,
            price: item.price,
            discountPrice: item.discountPrice,
            unit: item.unit,
            isFallback: true, // Not yet in backend DB - blocks fake API calls
        };
    });
};
