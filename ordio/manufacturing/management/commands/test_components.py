from django.core.management.base import BaseCommand
from manufacturing.models import ManufacturingOrder, MOComponentRequirement
from products.models import Product
from bom.models import BOM, BOMComponent
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Test if components are being saved with MO'

    def handle(self, *args, **options):
        # Check if we have any MOs with components
        mos = ManufacturingOrder.objects.all()
        self.stdout.write(f"Found {mos.count()} Manufacturing Orders")
        
        for mo in mos:
            components_count = mo.component_requirements.count()
            self.stdout.write(f"MO {mo.mo_number}: {components_count} components")
            
            if components_count > 0:
                for comp in mo.component_requirements.all():
                    self.stdout.write(f"  - {comp.component_name}: {comp.required_quantity}")
            else:
                # Check if BOM has components
                bom_components = mo.bom.components.count()
                self.stdout.write(f"  BOM has {bom_components} components")
                
                if bom_components > 0:
                    self.stdout.write("  Populating components from BOM...")
                    mo.populate_components_from_bom()
                    self.stdout.write(f"  Now has {mo.component_requirements.count()} components")