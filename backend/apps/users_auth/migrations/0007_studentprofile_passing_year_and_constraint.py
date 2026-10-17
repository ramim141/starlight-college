from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users_auth', '0006_studentprofile_guardian_whatsapp_number_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='studentprofile',
            name='passing_year',
            field=models.CharField(blank=True, db_index=True, default='', max_length=4),
        ),
        migrations.AddConstraint(
            model_name='studentprofile',
            constraint=models.UniqueConstraint(
                fields=('ssc_roll', 'passing_year'),
                name='unique_student_ssc_roll_passing_year',
            ),
        ),
    ]
