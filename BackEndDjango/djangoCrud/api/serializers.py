from django.contrib.auth.models import Group, User
from rest_framework import serializers
from djangoCrud.api.models import Movie, Serie, Episode


class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ["id","title", "desc", "year", "image", "video"]

class EpisodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Episode
        fields = ["id", "title", "video", "season_number", "episode_number"]

class SerieSerializer(serializers.ModelSerializer):
    episode_list = EpisodeSerializer(many=True, read_only=True)
    class Meta:
        model = Serie
        fields = ["id","title", "desc", "year", "image", "video", "seasons", "episodes", "episode_list"]
