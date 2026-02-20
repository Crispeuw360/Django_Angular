from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets
from djangoCrud.api.models import Movie, Serie
from djangoCrud.api.serializers import MovieSerializer, SerieSerializer
from django.db.models import Q

class MovieViewSet(viewsets.ModelViewSet):
    # Usamos all() pero el filtrado real ocurre en get_queryset
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Optimización: Solo traer los campos necesarios o usar select_related si hubiera FKs
        queryset = self.queryset 
        
        search = self.request.query_params.get('search', None)
        genre = self.request.query_params.get('genre', None)

        if search:
            # Optimizamos: icontains es lento en bases de datos grandes. 
            # istartswith es más rápido para "búsqueda automática" mientras escribes.
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(desc__icontains=search)
            ).distinct() # Evita duplicados si la búsqueda coincide en varios campos

        if genre and genre != 'all':
            queryset = queryset.filter(genre=genre)
        
        # Solo limitar resultados en listas, no en detalle
        if self.action == 'list':
            return queryset[:20]
        return queryset 

class SerieViewSet(viewsets.ModelViewSet):
    queryset = Serie.objects.all()
    serializer_class = SerieSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = self.queryset
        
        search = self.request.query_params.get('search', None)
        genre = self.request.query_params.get('genre', None)

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(desc__icontains=search)
            ).distinct()

        if genre and genre != 'all':
            queryset = queryset.filter(genre=genre)

        # Solo limitar resultados en listas, no en detalle
        if self.action == 'list':
            return queryset[:20]
        return queryset