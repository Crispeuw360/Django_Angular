from django.db import models

# Genre choices for movies and series
GENRE_CHOICES = [
    ('action', 'Action'),
    ('comedy', 'Comedy'),
    ('drama', 'Drama'),
    ('horror', 'Horror'),
    ('sci-fi', 'Sci-Fi'),
    ('thriller', 'Thriller'),
    ('romance', 'Romance'),
    ('animation', 'Animation'),
    ('documentary', 'Documentary'),
    ('adventure', 'Adventure'),
    ('fantasy', 'Fantasy'),
    ('mystery', 'Mystery'),
]

# Create your models here.
class Movie(models.Model):
    title = models.CharField(max_length=32)
    desc = models.CharField(max_length=256)
    year = models.IntegerField()
    image = models.ImageField(upload_to='movies/', null=True, blank=True)
    video = models.FileField(upload_to='videos/', null=True, blank=True)
    genre = models.CharField(max_length=32, choices=GENRE_CHOICES, default='drama')

class Serie(models.Model):
    title = models.CharField(max_length=32)
    desc = models.CharField(max_length=256)
    year = models.IntegerField()
    image = models.ImageField(upload_to='series/', null=True, blank=True)
    video = models.FileField(upload_to='videos/', null=True, blank=True)
    seasons = models.IntegerField()
    episodes = models.IntegerField()
    genre = models.CharField(max_length=32, choices=GENRE_CHOICES, default='drama')

class Episode(models.Model):
    title = models.CharField(max_length=64)
    video = models.FileField(upload_to='episodes/', null=True, blank=True)
    season_number = models.IntegerField()
    episode_number = models.IntegerField()
    serie = models.ForeignKey(Serie, on_delete=models.CASCADE, related_name='episode_list')

    def __str__(self):
        return f"{self.serie.title} - S{self.season_number}E{self.episode_number} - {self.title}"

    