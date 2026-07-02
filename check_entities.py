import os, sys, django
sys.path.insert(0, r"C:\Users\DELL\Documents\projects\freshfarm")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "freshapp.settings")
django.setup()

from core_app.models import Seller, User
from core_product.models import Category, Product, ProductVariant

print("--- Sellers ---")
for s in Seller.objects.all():
    print(f"Seller ID: {s.id}, Business: {s.business_name}, User: {s.user.username}, Role: {s.user.role}")

print("\n--- Categories ---")
for c in Category.objects.all():
    print(f"Category ID: {c.id}, Name: {c.name}, Type: {c.category_type}, Image: {c.image}")

print(f"\nTotal Products: {Product.objects.count()}")
print(f"Total Variants: {ProductVariant.objects.count()}")
