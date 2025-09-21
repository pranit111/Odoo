from django.core.management.base import BaseCommand
from manufacturing.models import ManufacturingOrder, MOComponentRequirement

class Command(BaseCommand):
    help = 'Fix Manufacturing Order component requirements'

    def add_arguments(self, parser):
        parser.add_argument(
            '--mo-number',
            type=str,
            help='Fix specific MO by number',
        )

    def handle(self, *args, **options):
        mo_number = options.get('mo_number')
        
        if mo_number:
            mos = ManufacturingOrder.objects.filter(mo_number=mo_number)
            if not mos.exists():
                self.stdout.write(
                    self.style.ERROR(f'MO {mo_number} not found')
                )
                return
        else:
            mos = ManufacturingOrder.objects.all()
        
        fixed_count = 0
        for mo in mos:
            self.stdout.write(f'Processing MO: {mo.mo_number}')
            
            # Check current component requirements
            current_reqs = mo.component_requirements.all()
            self.stdout.write(f'  Current components: {current_reqs.count()}')
            
            for req in current_reqs:
                expected_required = req.quantity_per_unit * mo.quantity_to_produce
                if req.required_quantity != expected_required:
                    self.stdout.write(
                        self.style.WARNING(
                            f'    {req.component.name}: '
                            f'qty_per_unit={req.quantity_per_unit}, '
                            f'current_required={req.required_quantity}, '
                            f'expected_required={expected_required}'
                        )
                    )
                    
                    # Fix the required quantity
                    req.required_quantity = expected_required
                    req.save()
                    fixed_count += 1
                    
                    self.stdout.write(
                        self.style.SUCCESS(f'    Fixed: {req.component.name}')
                    )
            
            # If no components exist, populate from BOM
            if not current_reqs.exists() and mo.bom:
                self.stdout.write('  No components found, populating from BOM...')
                mo.populate_components_from_bom()
                fixed_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'  Populated {mo.component_requirements.count()} components from BOM')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Fixed {fixed_count} component requirements')
        )