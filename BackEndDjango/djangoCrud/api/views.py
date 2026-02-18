from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets
from djangoCrud.api.models import Movie, Serie
from djangoCrud.api.serializers import  MovieSerializer, SerieSerializer
from django.db.models import Q


class MovieViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(desc__icontains=search)
            )
        return queryset

class SerieViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    queryset = Serie.objects.all()
    serializer_class = SerieSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(desc__icontains=search)
            )
        return queryset