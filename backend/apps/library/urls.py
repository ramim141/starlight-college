from django.urls import include, path
from rest_framework.routers import DefaultRouter
from apps.library.views import (
    BookBorrowRequestViewSet,
    BookCategoryViewSet,
    BookViewSet,
)

app_name = 'library'

router = DefaultRouter()
router.register(r'categories', BookCategoryViewSet, basename='book-category')
router.register(r'books', BookViewSet, basename='book')
router.register(r'borrow', BookBorrowRequestViewSet, basename='book-borrow')

urlpatterns = [
    path('', include(router.urls)),
]