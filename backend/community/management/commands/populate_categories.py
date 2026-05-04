# community/management/commands/populate_categories.py
# Save this file in: community/management/commands/populate_categories.py

from django.core.management.base import BaseCommand
from community.models import CommunityCategory


class Command(BaseCommand):
    help = 'Populate community categories with proper icons'

    def handle(self, *args, **kwargs):
        categories = [
            {
                'name': 'Anxiety & Stress',
                'description': 'Share experiences and coping strategies for anxiety and stress',
                'icon': '💗',  # Heart emoji
                'color': '#EF4444',
                'display_order': 1
            },
            {
                'name': 'Depression',
                'description': 'Support and understanding for those dealing with depression',
                'icon': '🌧️',  # Cloud with rain emoji
                'color': '#3B82F6',
                'display_order': 2
            },
            {
                'name': 'General Support',
                'description': 'General mental health discussions and support',
                'icon': '👥',  # Users emoji
                'color': '#10B981',
                'display_order': 3
            },
            {
                'name': 'Self-Care & Wellness',
                'description': 'Tips and experiences about self-care and wellness',
                'icon': '💆',  # Person getting massage emoji
                'color': '#8B5CF6',
                'display_order': 4
            },
            {
                'name': 'Relationships',
                'description': 'Discuss relationship challenges and experiences',
                'icon': '🤝',  # Handshake emoji
                'color': '#EC4899',
                'display_order': 5
            },
            {
                'name': 'Success Stories',
                'description': 'Share your progress and success stories',
                'icon': '⭐',  # Star emoji
                'color': '#F59E0B',
                'display_order': 6
            },
        ]

        for cat_data in categories:
            category, created = CommunityCategory.objects.update_or_create(
                name=cat_data['name'],
                defaults={
                    'description': cat_data['description'],
                    'icon': cat_data['icon'],
                    'color': cat_data['color'],
                    'display_order': cat_data['display_order'],
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Created category: {category.name} {cat_data["icon"]}')
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Updated category: {category.name} {cat_data["icon"]}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\n🎉 Successfully populated {len(categories)} categories!')
        )