from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from djangoCrud.api.models import Movie, Serie
from djangoCrud.api.serializers import MovieSerializer, SerieSerializer
from django.db.models import Q
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


class RegisterView(APIView):
    """
    Vista para registrar nuevos usuarios.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        password2 = request.data.get('password2')

        # Validaciones
        if not username or not email or not password or not password2:
            return Response(
                {'error': 'Todos los campos son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if password != password2:
            return Response(
                {'error': 'Las contraseñas no coinciden'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'El nombre de usuario ya existe'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'El email ya está registrado'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar contraseña con las reglas de Django
        try:
            validate_password(password)
        except ValidationError as e:
            return Response(
                {'error': list(e.messages)},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Crear usuario
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        return Response(
            {'message': 'Usuario creado exitosamente', 'user_id': user.id},
            status=status.HTTP_201_CREATED
        )


class MovieViewSet(viewsets.ModelViewSet):
    """
    API endpoint para ver y gestionar películas.
    Requiere autenticación JWT para todos los métodos.
    """
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [IsAuthenticated]

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
    """
    API endpoint para ver y gestionar series.
    Requiere autenticación JWT para todos los métodos.
    """
    queryset = Serie.objects.all()
    serializer_class = SerieSerializer
    permission_classes = [IsAuthenticated]

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