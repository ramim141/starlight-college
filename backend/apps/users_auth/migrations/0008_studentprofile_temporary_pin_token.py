from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users_auth', '0007_studentprofile_passing_year_and_constraint'),
    ]

    operations = [
        migrations.AddField(
            model_name='studentprofile',
            name='temporary_pin_token',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
    ]
