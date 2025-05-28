from django.db import models

class Artist(models.Model):
    name = models.CharField(max_length=255, unique=True)

    class Meta:
        db_table = "artists"

class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "genres"

class Song(models.Model):
    title = models.CharField(max_length=255)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    duration = models.IntegerField()
    release_date = models.DateField(null=True, blank=True)
    genre = models.ForeignKey(Genre, null=True, blank=True, on_delete=models.SET_NULL)
    play_count = models.PositiveIntegerField(default=0)
    audio_file = models.FileField(upload_to='songs/', default='default.mp3')
    image = models.ImageField(upload_to='song_images/', null=True, blank=True)
    is_premium = models.BooleanField(default=False)

    class Meta:
        db_table = "songs"
