from pathlib import Path

from django.core.exceptions import ValidationError


def validate_upload(file, allowed_extensions, max_size_mb=10):
    if not file:
        return file
    extension = Path(file.name).suffix.lower()
    if extension not in allowed_extensions:
        raise ValidationError(
            f"Unsupported file type. Allowed types: {', '.join(sorted(allowed_extensions))}."
        )
    if file.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"File size must not exceed {max_size_mb} MB.")
    return file
