from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(username, email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    profile_pic = models.CharField(max_length=100, default="null")
    fullname = models.CharField(max_length=100, default="null")
    dateRegister = models.DateField(null=True, blank=True)
    monthRegister = models.IntegerField(default=2)

    isRegister = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    role = models.CharField(max_length=50, default="customer")

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "fullname"]

    objects = UserManager()

    class Meta:
        db_table = "users"
