"""
=============================================================
  FreshFarm - Django Grocery Products Seeder
=============================================================
HOW TO RUN on your server:
  1. SSH / connect to your server at 187.127.149.81
  2. Navigate to your Django project folder
  3. Run: python manage.py shell < django_seed_grocery.py
     OR paste this code in: python manage.py shell

This will create:
  - 11 grocery categories
  - 90 grocery products with variants
=============================================================
"""

# -------------------------------------------------------
# STEP 1: Find your actual model names
# -------------------------------------------------------
# Adjust these imports to match YOUR Django app & model names
# Common patterns: 'products', 'store', 'inventory', 'catalog'

# Try these imports one by one until you find which works:
try:
    from products.models import Category, Product, ProductVariant
    print("✅ Imported from 'products' app")
except ImportError:
    try:
        from store.models import Category, Product, ProductVariant
        print("✅ Imported from 'store' app")
    except ImportError:
        try:
            from inventory.models import Category, Product, ProductVariant
            print("✅ Imported from 'inventory' app")
        except ImportError:
            print("❌ Could not find models. Run: python manage.py shell")
            print("   Then type: from django.apps import apps")
            print("   Then type: [m.__name__ for m in apps.get_models()]")
            print("   This lists all models. Find Category, Product, Variant models.")
            raise

# -------------------------------------------------------
# STEP 2: Grocery categories data
# -------------------------------------------------------
grocery_categories = [
    {"name": "Atta, Rice & Dal",       "category_type": "grocery"},
    {"name": "Oil, Ghee & Masala",     "category_type": "grocery"},
    {"name": "Dairy, Bread & Eggs",    "category_type": "grocery"},
    {"name": "Bakery & Biscuits",      "category_type": "grocery"},
    {"name": "Dry Fruits & Cereals",   "category_type": "grocery"},
    {"name": "Chicken, Meat & Fish",   "category_type": "grocery"},
    {"name": "Kitchenware & Appliances","category_type": "grocery"},
    {"name": "Chips & Namkeen",        "category_type": "grocery"},
    {"name": "Sweets & Chocolates",    "category_type": "grocery"},
    {"name": "Drinks & Juices",        "category_type": "grocery"},
    {"name": "Tea, Coffee & Milk Drinks","category_type": "grocery"},
]

# -------------------------------------------------------
# STEP 3: Grocery products data (name, category, price, unit)
# -------------------------------------------------------
grocery_products = [
    # Atta, Rice & Dal
    {"name": "Aashirvaad Shudh Chakki Atta", "category": "Atta, Rice & Dal", "brand": "Aashirvaad", "price": 265, "unit": "5 kg"},
    {"name": "India Gate Basmati Rice",       "category": "Atta, Rice & Dal", "brand": "India Gate",  "price": 150, "unit": "1 kg"},
    {"name": "Tata Sampann Toor Dal",         "category": "Atta, Rice & Dal", "brand": "Tata Sampann","price": 195, "unit": "1 kg"},
    {"name": "Tata Sampann Moong Dal",        "category": "Atta, Rice & Dal", "brand": "Tata Sampann","price": 165, "unit": "1 kg"},
    {"name": "Fortune Chakki Fresh Atta",     "category": "Atta, Rice & Dal", "brand": "Fortune",     "price": 250, "unit": "5 kg"},
    {"name": "Daawat Devaaya Basmati Rice",   "category": "Atta, Rice & Dal", "brand": "Daawat",      "price": 399, "unit": "5 kg"},
    {"name": "Tata Sampann Chana Dal",        "category": "Atta, Rice & Dal", "brand": "Tata Sampann","price": 110, "unit": "1 kg"},
    {"name": "Tata Sampann Kabuli Chana",     "category": "Atta, Rice & Dal", "brand": "Tata Sampann","price": 85,  "unit": "500 g"},
    {"name": "India Gate Toor Dal",           "category": "Atta, Rice & Dal", "brand": "India Gate",  "price": 110, "unit": "1 kg"},

    # Oil, Ghee & Masala
    {"name": "Amul Pure Ghee",                "category": "Oil, Ghee & Masala","brand": "Amul",   "price": 545, "unit": "1 L"},
    {"name": "Fortune Sunlite Sunflower Oil", "category": "Oil, Ghee & Masala","brand": "Fortune","price": 135, "unit": "1 L"},
    {"name": "Saffola Gold Refined Oil",      "category": "Oil, Ghee & Masala","brand": "Saffola","price": 160, "unit": "1 L"},
    {"name": "Everest Turmeric Powder",       "category": "Oil, Ghee & Masala","brand": "Everest","price": 60,  "unit": "200 g"},
    {"name": "Everest Kashmirilal Chilli",    "category": "Oil, Ghee & Masala","brand": "Everest","price": 80,  "unit": "100 g"},
    {"name": "MDH Deggi Mirch Powder",        "category": "Oil, Ghee & Masala","brand": "MDH",    "price": 85,  "unit": "100 g"},
    {"name": "Catch Garam Masala",            "category": "Oil, Ghee & Masala","brand": "Catch",  "price": 75,  "unit": "100 g"},
    {"name": "Tata Salt Iodized",             "category": "Oil, Ghee & Masala","brand": "Tata",   "price": 26,  "unit": "1 kg"},

    # Dairy, Bread & Eggs
    {"name": "Amul Taaza Fresh Toned Milk",  "category": "Dairy, Bread & Eggs","brand": "Amul",         "price": 68,  "unit": "1 L"},
    {"name": "Amul Butter",                  "category": "Dairy, Bread & Eggs","brand": "Amul",         "price": 265, "unit": "500 g"},
    {"name": "Mother Dairy Paneer",          "category": "Dairy, Bread & Eggs","brand": "Mother Dairy", "price": 90,  "unit": "200 g"},
    {"name": "Mother Dairy Fresh Dahi",      "category": "Dairy, Bread & Eggs","brand": "Mother Dairy", "price": 32,  "unit": "400 g"},
    {"name": "Britannia White Bread",        "category": "Dairy, Bread & Eggs","brand": "Britannia",    "price": 32,  "unit": "400 g"},
    {"name": "Harvest Gold Brown Bread",     "category": "Dairy, Bread & Eggs","brand": "Harvest Gold", "price": 45,  "unit": "400 g"},
    {"name": "Amul Cheese Slices",           "category": "Dairy, Bread & Eggs","brand": "Amul",         "price": 150, "unit": "200 g"},
    {"name": "Fresh White Eggs",             "category": "Dairy, Bread & Eggs","brand": "Eggo",         "price": 65,  "unit": "10 pieces"},
    {"name": "Amul Masti Spiced Buttermilk", "category": "Dairy, Bread & Eggs","brand": "Amul",         "price": 18,  "unit": "200 ml"},

    # Bakery & Biscuits
    {"name": "Britannia Good Day Cashew Cookies", "category": "Bakery & Biscuits","brand": "Britannia","price": 35,  "unit": "200 g"},
    {"name": "Parle-G Biscuits",                  "category": "Bakery & Biscuits","brand": "Parle",    "price": 70,  "unit": "800 g"},
    {"name": "Sunfeast Dark Fantasy Choco Fills",  "category": "Bakery & Biscuits","brand": "Sunfeast", "price": 100, "unit": "300 g"},
    {"name": "Oreo Vanilla Creme Biscuit",         "category": "Bakery & Biscuits","brand": "Oreo",     "price": 35,  "unit": "120 g"},
    {"name": "Britannia Marie Gold",               "category": "Bakery & Biscuits","brand": "Britannia","price": 40,  "unit": "250 g"},
    {"name": "Sunfeast Mom's Magic Cashew",        "category": "Bakery & Biscuits","brand": "Sunfeast", "price": 30,  "unit": "150 g"},
    {"name": "Unibic Chocolate Chip Cookies",      "category": "Bakery & Biscuits","brand": "Unibic",   "price": 45,  "unit": "150 g"},
    {"name": "Britannia Bourbon Biscuits",         "category": "Bakery & Biscuits","brand": "Britannia","price": 25,  "unit": "150 g"},

    # Dry Fruits & Cereals
    {"name": "Happilo Premium California Almonds", "category": "Dry Fruits & Cereals","brand": "Happilo",  "price": 220, "unit": "200 g"},
    {"name": "Happilo Premium Whole Cashews",      "category": "Dry Fruits & Cereals","brand": "Happilo",  "price": 260, "unit": "200 g"},
    {"name": "Farmley Almonds",                    "category": "Dry Fruits & Cereals","brand": "Farmley",  "price": 199, "unit": "200 g"},
    {"name": "Kellogg's Corn Flakes",              "category": "Dry Fruits & Cereals","brand": "Kellogg's","price": 120, "unit": "250 g"},
    {"name": "Quaker Oats",                        "category": "Dry Fruits & Cereals","brand": "Quaker",   "price": 180, "unit": "1 kg"},
    {"name": "Kellogg's Muesli Fruit & Nut",       "category": "Dry Fruits & Cereals","brand": "Kellogg's","price": 320, "unit": "500 g"},
    {"name": "Baggry's White Oats",                "category": "Dry Fruits & Cereals","brand": "Baggry's", "price": 160, "unit": "1 kg"},
    {"name": "Happilo Premium Walnuts",            "category": "Dry Fruits & Cereals","brand": "Happilo",  "price": 340, "unit": "200 g"},

    # Chicken, Meat & Fish
    {"name": "Licious Fresh Chicken Curry Cut",     "category": "Chicken, Meat & Fish","brand": "Licious",  "price": 159, "unit": "500 g"},
    {"name": "Licious Fresh Chicken Breast",        "category": "Chicken, Meat & Fish","brand": "Licious",  "price": 249, "unit": "450 g"},
    {"name": "Zorabian Chicken Seekh Kebab",        "category": "Chicken, Meat & Fish","brand": "Zorabian", "price": 195, "unit": "250 g"},
    {"name": "Prasuma Chicken Momos Original",      "category": "Chicken, Meat & Fish","brand": "Prasuma",  "price": 175, "unit": "10 pieces"},
    {"name": "Licious Mutton Curry Cut",            "category": "Chicken, Meat & Fish","brand": "Licious",  "price": 599, "unit": "500 g"},
    {"name": "Licious Fresh Rohu Fish Bengali Cut", "category": "Chicken, Meat & Fish","brand": "Licious",  "price": 269, "unit": "500 g"},
    {"name": "Zorabian Frozen Chicken Nuggets",     "category": "Chicken, Meat & Fish","brand": "Zorabian", "price": 299, "unit": "500 g"},
    {"name": "Licious Chicken Drumsticks",          "category": "Chicken, Meat & Fish","brand": "Licious",  "price": 219, "unit": "500 g"},

    # Kitchenware & Appliances
    {"name": "Pigeon Hard Anodised Kadai",      "category": "Kitchenware & Appliances","brand": "Pigeon",    "price": 699,  "unit": "1 piece"},
    {"name": "Prestige Non-Stick Fry Pan",      "category": "Kitchenware & Appliances","brand": "Prestige",  "price": 899,  "unit": "1 piece"},
    {"name": "Milton Thermosteel Bottle",       "category": "Kitchenware & Appliances","brand": "Milton",    "price": 850,  "unit": "1 L"},
    {"name": "Borosil Glass Lunch Box Set",     "category": "Kitchenware & Appliances","brand": "Borosil",   "price": 999,  "unit": "3 pieces"},
    {"name": "Cello Plastic Water Bottle Set",  "category": "Kitchenware & Appliances","brand": "Cello",     "price": 249,  "unit": "6 pieces"},
    {"name": "Prestige Electric Kettle 1.5L",   "category": "Kitchenware & Appliances","brand": "Prestige",  "price": 1195, "unit": "1 piece"},
    {"name": "Milton Premium Casserole",        "category": "Kitchenware & Appliances","brand": "Milton",    "price": 475,  "unit": "1 piece"},
    {"name": "Surf Excel Matic",                "category": "Kitchenware & Appliances","brand": "Surf Excel","price": 210,  "unit": "1 kg"},

    # Chips & Namkeen
    {"name": "Lays Classic Salted Potato Chips",     "category": "Chips & Namkeen","brand": "Lays",      "price": 20,  "unit": "52 g"},
    {"name": "Kurkure Masala Munch",                 "category": "Chips & Namkeen","brand": "Kurkure",   "price": 27,  "unit": "90 g"},
    {"name": "Haldiram's Aloo Bhujia",               "category": "Chips & Namkeen","brand": "Haldiram's","price": 99,  "unit": "400 g"},
    {"name": "Haldiram's Moong Dal",                 "category": "Chips & Namkeen","brand": "Haldiram's","price": 45,  "unit": "150 g"},
    {"name": "Bingo Tedhe Medhe",                    "category": "Chips & Namkeen","brand": "Bingo",     "price": 27,  "unit": "90 g"},
    {"name": "Lays American Style Cream & Onion",    "category": "Chips & Namkeen","brand": "Lays",      "price": 20,  "unit": "52 g"},
    {"name": "Bikaji Bhujia Sev",                    "category": "Chips & Namkeen","brand": "Bikaji",    "price": 105, "unit": "400 g"},
    {"name": "Maggi 2-Minute Noodles",               "category": "Chips & Namkeen","brand": "Maggi",     "price": 14,  "unit": "70 g"},

    # Sweets & Chocolates
    {"name": "Cadbury Dairy Milk Silk",  "category": "Sweets & Chocolates","brand": "Cadbury", "price": 75,  "unit": "150 g"},
    {"name": "KitKat 4 Finger",          "category": "Sweets & Chocolates","brand": "Nestle",  "price": 28,  "unit": "38 g"},
    {"name": "Amul Dark Chocolate",      "category": "Sweets & Chocolates","brand": "Amul",    "price": 100, "unit": "150 g"},
    {"name": "Haldiram's Gulab Jamun",   "category": "Sweets & Chocolates","brand": "Haldiram's","price": 230,"unit": "1 kg"},
    {"name": "Haldiram's Rasgulla",      "category": "Sweets & Chocolates","brand": "Haldiram's","price": 220,"unit": "1 kg"},
    {"name": "Ferrero Rocher",           "category": "Sweets & Chocolates","brand": "Ferrero", "price": 899, "unit": "16 pieces"},
    {"name": "Snickers Chocolate Bar",   "category": "Sweets & Chocolates","brand": "Snickers","price": 45,  "unit": "50 g"},
    {"name": "Cadbury 5 Star",           "category": "Sweets & Chocolates","brand": "Cadbury", "price": 10,  "unit": "40 g"},

    # Drinks & Juices
    {"name": "Coca-Cola Soft Drink",              "category": "Drinks & Juices","brand": "Coca-Cola", "price": 60,  "unit": "1.25 L"},
    {"name": "Pepsi Soft Drink",                  "category": "Drinks & Juices","brand": "Pepsi",     "price": 60,  "unit": "1.25 L"},
    {"name": "Real Fruit Power Mixed Fruit Juice","category": "Drinks & Juices","brand": "Real",      "price": 110, "unit": "1 L"},
    {"name": "Tropicana 100% Orange Juice",       "category": "Drinks & Juices","brand": "Tropicana", "price": 120, "unit": "1 L"},
    {"name": "Red Bull Energy Drink",             "category": "Drinks & Juices","brand": "Red Bull",  "price": 115, "unit": "250 ml"},
    {"name": "Sprite Soft Drink",                 "category": "Drinks & Juices","brand": "Sprite",    "price": 60,  "unit": "1.25 L"},
    {"name": "Real Fruit Power Guava Juice",      "category": "Drinks & Juices","brand": "Real",      "price": 110, "unit": "1 L"},
    {"name": "Limca Lime N Lemon Drink",          "category": "Drinks & Juices","brand": "Limca",     "price": 60,  "unit": "1.25 L"},

    # Tea, Coffee & Milk Drinks
    {"name": "Nescafe Classic Coffee",       "category": "Tea, Coffee & Milk Drinks","brand": "Nescafe",     "price": 180, "unit": "100 g"},
    {"name": "Tata Tea Premium",             "category": "Tea, Coffee & Milk Drinks","brand": "Tata",        "price": 380, "unit": "1 kg"},
    {"name": "Brooke Bond Red Label Tea",    "category": "Tea, Coffee & Milk Drinks","brand": "Brooke Bond", "price": 310, "unit": "500 g"},
    {"name": "Bru Instant Coffee",           "category": "Tea, Coffee & Milk Drinks","brand": "Bru",         "price": 165, "unit": "100 g"},
    {"name": "Horlicks Chocolate Delight",   "category": "Tea, Coffee & Milk Drinks","brand": "Horlicks",    "price": 275, "unit": "500 g"},
    {"name": "Bournvita Chocolate Drink",    "category": "Tea, Coffee & Milk Drinks","brand": "Bournvita",   "price": 255, "unit": "500 g"},
    {"name": "Lipton Green Tea Honey Lemon", "category": "Tea, Coffee & Milk Drinks","brand": "Lipton",      "price": 130, "unit": "25 Bags"},
    {"name": "Taj Mahal Tea",                "category": "Tea, Coffee & Milk Drinks","brand": "Taj Mahal",   "price": 220, "unit": "250 g"},
]

# -------------------------------------------------------
# STEP 4: Create categories
# -------------------------------------------------------
print("\n📦 Creating grocery categories...")
cat_map = {}
for cat_data in grocery_categories:
    cat, created = Category.objects.get_or_create(
        name=cat_data["name"],
        defaults={"category_type": cat_data["category_type"]}
    )
    # If field name differs in your model, adjust here:
    # e.g. cat_type -> type, section -> category_type etc.
    cat_map[cat_data["name"]] = cat
    status = "✅ Created" if created else "⚠️  Already exists"
    print(f"  {status}: {cat.name}")

# -------------------------------------------------------
# STEP 5: Create products + variants
# -------------------------------------------------------
print("\n🛒 Creating grocery products with variants...")
created_count = 0
skipped_count = 0

for prod_data in grocery_products:
    cat = cat_map.get(prod_data["category"])
    if not cat:
        print(f"  ❌ Category not found: {prod_data['category']}")
        continue

    product, prod_created = Product.objects.get_or_create(
        name=prod_data["name"],
        category=cat,
        defaults={
            # Adjust field names to match YOUR Product model:
            # "brand": prod_data["brand"],  # uncomment if you have brand field
            # "is_active": True,            # uncomment if you have is_active field
        }
    )

    if prod_created:
        # Create the variant
        variant, var_created = ProductVariant.objects.get_or_create(
            product=product,
            unit=prod_data["unit"],
            defaults={
                "price": prod_data["price"],
                # "stock": 100,    # uncomment if you have stock field
                # "sku": f"SKU-{product.id}-1",  # uncomment if you have sku
            }
        )
        created_count += 1
        print(f"  ✅ Created: {product.name} | ₹{prod_data['price']} / {prod_data['unit']} | Variant ID: {variant.id}")
    else:
        skipped_count += 1
        print(f"  ⚠️  Exists:  {product.name}")

print(f"\n{'='*50}")
print(f"✅ Done! Created {created_count} products, skipped {skipped_count} existing.")
print(f"{'='*50}")
print("\n📋 Next steps:")
print("  1. Go to http://187.127.149.81/admin/ and verify the products")
print("  2. If field name errors occur, check your model with:")
print("     python manage.py shell")
print("     from your_app.models import Product")
print("     print([f.name for f in Product._meta.fields])")
