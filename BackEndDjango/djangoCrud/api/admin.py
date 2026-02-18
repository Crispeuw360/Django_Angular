from django.contrib import admin
from django.contrib import admin
from djangoCrud.api.models import Movie, Serie, Episode

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ['title', 'year', 'genre']
    list_filter = ['genre', 'year']
    search_fields = ['title', 'desc']

@admin.register(Serie)
class SerieAdmin(admin.ModelAdmin):
    list_display = ['title', 'year', 'genre', 'seasons', 'episodes']
    list_filter = ['genre', 'year']
    search_fields = ['title', 'desc']

admin.site.register(Episode)



