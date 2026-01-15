// src/pages/Rota/MapaGratuito.tsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Box,
  VStack,
  Text,
  Badge,
  Center,
  Spinner,
  Button,
  HStack,
  border,
} from '@chakra-ui/react';
import { useParams } from "react-router-dom";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface PontoRota {
  id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  cidade: string;
  estado: string;
   bairro?: string;
  status: 'em_movimento' | 'parado' | 'descanso' | 'Chegada';
  velocidade: number;
  descricao?: string;
}

interface MapaGratuitoProps {
  pontos?: PontoRota[];
  pontoAtual?: PontoRota | null;
  origem?: string;
  destino?: string;
}

interface Viagem {
  id: number;
  origem: string;
  destino: string;
  motorista: string;
  viatura: string;
  status: "Pendente" | "Em andamento" | "Concluída" | "Cancelada";
}

interface RotaCalculada {
  coordenadas: [number, number][];
  distancia: number; 
  duracao: number;   
}

const PONTOS_MOCK: PontoRota[] = [
  {
    id: 1,
    latitude: -3.11426,   
    longitude: -60.05577,
    timestamp: '2024-01-15T08:00:00',
    cidade: 'Manaus',
    estado: 'AM',
    status: 'em_movimento',
    velocidade: 0,
    descricao: 'Saida'
  },
  {
    id: 2,
    latitude: -2.05348,    
    longitude: -60.02330,
    timestamp: '2024-01-15T10:30:00',
    cidade: 'Presidente Figueiredo',  
    estado: 'AM',                     
    status: 'em_movimento',
    velocidade: 80,
    descricao: 'Rodoviária de Presidente Figueiredo'
  },
  {
    id: 3,
    latitude: 2.8235,
    longitude: -60.6758,
    timestamp: '2024-01-15T14:00:00',
    cidade: 'Boa Vista',
    estado: 'BVB',
    status: 'Chegada',
    velocidade: 0,
    descricao: 'Chegada'
  }
];

const ORIGEM_MOCK = 'Flores ';
const DESTINO_MOCK = 'Ponta Negra';
const PONTO_ATUAL_MOCK = PONTOS_MOCK[1]; 

function AjustarMapa({ pontos }: { pontos: PontoRota[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (pontos.length > 0) {
      const bounds = L.latLngBounds(pontos.map(p => [p.latitude, p.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [pontos, map]);
  
  return null;
}

const formatarDistancia = (metros: number): string => {
  if (metros < 1000) {
    return `${Math.round(metros)} m`;
  } else {
    const km = metros / 1000;
    if (km > 100) {
      return `${Math.round(km)} km`;
    }
    return `${km.toFixed(1)} km`;
  }
};

const calcularDistanciaEmLinhaReta = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; 
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
};

const obterRotaRealista = async (pontos: PontoRota[]): Promise<RotaCalculada> => {
  if (pontos.length < 2) {
    return {
      coordenadas: [],
      distancia: 0,
      duracao: 0
    };
  }

  try {
    const coordenadas = pontos.map(p => `${p.longitude},${p.latitude}`).join(';');
    
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordenadas}?overview=full&geometries=geojson`
    );
    
    const data = await response.json();
    
    if (data.routes && data.routes[0]) {
      const route = data.routes[0];
      const geometry = route.geometry;
      
      let coordenadasFormatadas: [number, number][] = [];
      
      if (geometry.type === 'LineString') {
        coordenadasFormatadas = geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      }
      
      return {
        coordenadas: coordenadasFormatadas,
        distancia: route.distance, 
        duracao: route.duration    
      };
    }
    
    const distanciaCalculada = calcularDistanciaEmLinhaReta(
      pontos[0].latitude, pontos[0].longitude,
      pontos[pontos.length - 1].latitude, pontos[pontos.length - 1].longitude
    );
    
    return {
      coordenadas: pontos.map(p => [p.latitude, p.longitude] as [number, number]),
      distancia: distanciaCalculada,
      duracao: 0 
    };
  } catch (error) {
    console.error('Erro ao obter rota da OSRM:', error);
    
    if (pontos.length >= 2) {
      const distanciaCalculada = calcularDistanciaEmLinhaReta(
        pontos[0].latitude, pontos[0].longitude,
        pontos[pontos.length - 1].latitude, pontos[pontos.length - 1].longitude
      );
      
      return {
        coordenadas: pontos.map(p => [p.latitude, p.longitude] as [number, number]),
        distancia: distanciaCalculada,
        duracao: 0
      };
    }
    
    return {
      coordenadas: [],
      distancia: 0,
      duracao: 0
    };
  }
};

const Mapa: React.FC<MapaGratuitoProps> = ({ 
  pontos = PONTOS_MOCK, 
  pontoAtual = PONTO_ATUAL_MOCK, 
  origem = ORIGEM_MOCK, 
  destino = DESTINO_MOCK 
}) => {
  const [mapaCarregado, setMapaCarregado] = useState(false);
  const [rotaCalculada, setRotaCalculada] = useState<RotaCalculada | null>(null);
  const [carregandoRota, setCarregandoRota] = useState(true);
  const [mostrarRotaRealista, setMostrarRotaRealista] = useState(true);
  const [viagemBasica, setViagemBasica] = useState<Viagem | null>(null);
  const { id } = useParams<{ id: string }>();
  
  useEffect(() => {
    const carregarRota = async () => {
      setCarregandoRota(true);
      const rota = await obterRotaRealista(pontos);
      setRotaCalculada(rota);
      setCarregandoRota(false);
    };
    
    carregarRota();
  }, [pontos]);

  useEffect(() => {
    if (!id) return;
    async function fetchViagemBasica() {
      try {
        const response = await fetch(
          `https://gestaofrota.onrender.com/api/viagens/${id}`
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar viagem");
        }

        const data = await response.json();

        const viagemBasica: Viagem = {
          id: data.id,
          origem: data.origem,
          destino: data.destino,
          motorista: data.motorista,
          viatura: data.viatura,
          status: data.status,
        };

        setViagemBasica(viagemBasica);
      } catch (err) {
        console.error("Erro ao buscar origem/destino", err);
      }
    }

    fetchViagemBasica();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_movimento': return '#48BB78'; 
      case 'parado': return '#ED8936'; 
      case 'descanso': return '#E53E3E'; 
      case 'Chegada': return '#5787f0ff'
      default: return '#718096'; 
    }
  };

  const criarIcone = (status: string, isAtual: boolean) => {
    const cor = getStatusColor(status);
    const tamanho = isAtual ? 40 : 30;
    
    return L.divIcon({
      html: `
        <div style="
          width: ${tamanho}px;
          height: ${tamanho}px;
          background: ${cor};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: ${isAtual ? '14px' : '12px'};
          ${isAtual ? 'animation: pulse 1.5s infinite;' : ''}
        ">
          ${isAtual ? '🚚' : '•'}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [tamanho, tamanho],
      iconAnchor: [tamanho / 2, tamanho / 2],
    });
  };

  const linhaReta = pontos.map(p => [p.latitude, p.longitude] as [number, number]);

  const calcularRotaPercorrida = () => {
    if (!pontoAtual || !rotaCalculada || rotaCalculada.coordenadas.length === 0) return [];
    
    const pontoAtualIndex = pontos.findIndex(p => p.id === pontoAtual.id);
    if (pontoAtualIndex <= 0) return [];
    
    const pontoAtualCoords: [number, number] = [pontoAtual.latitude, pontoAtual.longitude];
    const distances = rotaCalculada.coordenadas.map(coord => 
      Math.sqrt(
        Math.pow(coord[0] - pontoAtualCoords[0], 2) + 
        Math.pow(coord[1] - pontoAtualCoords[1], 2)
      )
    );
    
    const closestIndex = distances.indexOf(Math.min(...distances));
    
    return rotaCalculada.coordenadas.slice(0, closestIndex + 1);
  };

  const rotaPercorrida = calcularRotaPercorrida();

const calcularDistanciaTotal = (coordenadas: [number, number][]): number => {
  if (coordenadas.length < 2) return 0;
  
  let distanciaTotal = 0;
  
  for (let i = 0; i < coordenadas.length - 1; i++) {
    const [lat1, lon1] = coordenadas[i];
    const [lat2, lon2] = coordenadas[i + 1];
    distanciaTotal += calcularDistanciaEmLinhaReta(lat1, lon1, lat2, lon2);
  }
  
  return distanciaTotal;
};

const calcularDistanciaPercorrida = () => {
  if (!rotaCalculada || rotaPercorrida.length < 2) return 0;
  const distanciaRealPercorrida = calcularDistanciaTotal(rotaPercorrida);  
  return distanciaRealPercorrida;
};

  const distanciaPercorrida = calcularDistanciaPercorrida();

  if (pontos.length === 0) {
    return (
      <Center h="550px" bg="gray.50" borderRadius="lg">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">Carregando mapa...</Text>
        </VStack>
      </Center>
    );
  }

  const statusColorMap = {
    Pendente: { bg: "yellow.100", color: "yellow.700" },
    "Em andamento": { bg: "blue.100", color: "blue.700" },
    Concluída: { bg: "green.100", color: "green.700" },
    Cancelada: { bg: "red.100", color: "red.700" },
  };

  return (
    <Box w="100%" h="80%" position="relative" borderRadius="lg" overflow="hidden" marginTop="55px">
      <MapContainer
        center={[-3.0667, -60.0167]} 
        zoom={12}
        style={{ height: '550px', width: '100%', borderRadius: '8px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            load: () => setMapaCarregado(true),
          }}
        />

        {mostrarRotaRealista && rotaCalculada && rotaCalculada.coordenadas.length > 1 && (
          <>
            <Polyline
              pathOptions={{ 
                color: '#3182CE', 
                weight: 6, 
                opacity: 0.4,
              }}
              positions={rotaCalculada.coordenadas}
            />
            
            {rotaPercorrida.length > 1 && (
              <Polyline
                pathOptions={{ 
                  color: '#8af59cff', 
                  weight: 5, 
                  opacity: 0.9,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
                positions={rotaPercorrida}
              />
            )}
          </>
        )}

        {!mostrarRotaRealista && linhaReta.length > 1 && (
          <Polyline
            pathOptions={{ 
              color: '#3182CE', 
              weight: 4, 
              opacity: 0.8,
              dashArray: '10, 10' 
            }}
            positions={linhaReta}
          />
        )}

        {pontos.map((ponto) => (
          <Marker
            key={ponto.id}
            position={[ponto.latitude, ponto.longitude]}
            icon={criarIcone(ponto.status, pontoAtual?.id === ponto.id)}
          >
            <Popup>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm">{ponto.cidade} - {ponto.estado}</Text>
                <Badge colorScheme={
                  ponto.status === 'em_movimento' ? 'green' :
                  ponto.status === 'parado' ? 'yellow' : 'orange'
                }>
                  {ponto.status === 'em_movimento' ? 'Em Movimento' :
                   ponto.status === 'parado' ? 'Parado' : 'Descanço'}
                  {ponto.status === 'em_movimento' && ` • ${ponto.velocidade} km/h`}
                </Badge>
                {ponto.descricao && (
                  <Text fontSize="xs" color="gray.600">{ponto.descricao}</Text>
                )}
              </VStack>
            </Popup>
          </Marker>
        ))}

        <AjustarMapa pontos={pontos} />
      </MapContainer>

      <Box
        position="absolute"
        top="10px"
        left="10px"
        bg="white"
        p={4}
        borderRadius="lg"
        boxShadow="2xl"
        maxW="300px"
        zIndex="1000"
      >
        <VStack align="start" spacing={3}>
          {viagemBasica?.status && (
            <Box
              padding="6px"
              borderRadius="10px"
              fontWeight="bold"
              bg={statusColorMap[viagemBasica.status].bg}
              color={statusColorMap[viagemBasica.status].color}
            >
              {viagemBasica.status}
            </Box>
          )}
          <Text fontSize="md" color="gray.700" fontWeight="bold">
            {viagemBasica
              ? `${viagemBasica.origem} → ${viagemBasica.destino}`
              : `${origem} → ${destino}`}
          </Text>
          
          {rotaCalculada && rotaCalculada.distancia > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="bold" color="gray.700">
                📏 Distância total:
              </Text>
              <Text fontSize="sm" color="gray.600">
                {formatarDistancia(rotaCalculada.distancia)}
              </Text>
            </Box>
          )}
          
          {distanciaPercorrida > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="bold" color="gray.700">
                🚚 Percorrido:
              </Text>
              <Text fontSize="sm" color="gray.600">
                {formatarDistancia(distanciaPercorrida)}
              </Text>
            </Box>
          )}
          
          {pontoAtual && (
            <>
               <Box padding="0px" fontWeight="bold">
                Motorista: 
                <Box fontFamily="sans-serif" fontWeight="normal">
                  {viagemBasica?.motorista || 'Pendente'}
                </Box>
              </Box>
              <Box padding="0px" fontWeight="bold">
                Equipamento: 
                <Box fontFamily="sans-serif" fontWeight="normal">
                  {viagemBasica?.viatura || 'Modelo'} 
                </Box> 
              </Box>
              <Badge 
                colorScheme={
                  pontoAtual.status === 'em_movimento' ? 'green' :
                  pontoAtual.status === 'parado' ? 'yellow' : 'orange'
                }
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
              >
                {pontoAtual.status === 'em_movimento' ? 'Em Movimento' :
                 pontoAtual.status === 'parado' ? 'Parado' : 'Descanso'}
                {pontoAtual.status === 'em_movimento' && ` • ${pontoAtual.velocidade} km/h`}
              </Badge>
            </>
          )}
          {carregandoRota && (
            <HStack spacing={2}>
              <Spinner size="sm" color="blue.500" />
              <Text fontSize="xs" color="gray.500">Calculando rota...</Text>
            </HStack>
          )}
        </VStack>
      </Box>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .leaflet-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .leaflet-popup-content {
          margin: 12px !important;
        }
      `}</style>
    </Box>
  );
};

export default Mapa;