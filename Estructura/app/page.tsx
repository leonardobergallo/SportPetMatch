"use client"

import { useState } from "react"
import {
  Heart,
  MessageCircle,
  MapPin,
  Calendar,
  Users,
  Flame,
  Plus,
  Search,
  Map,
  PawPrint,
  MessageSquare,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Page() {
  const [activeTab, setActiveTab] = useState("home")
  const [likes, setLikes] = useState<Record<string, boolean>>({})

  const toggleLike = (id: string) => {
    setLikes((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const events = [
    {
      id: "event1",
      title: "Torneo de Fútbol",
      location: "Parque Central",
      date: "Sáb, 15 Nov",
      distance: "2.5 km",
      pets: 12,
      image: "/soccer-tournament-park.jpg",
      matched: true,
    },
    {
      id: "event2",
      title: "Carrera 5K",
      location: "Playa Negra",
      date: "Dom, 16 Nov",
      distance: "5.2 km",
      pets: 8,
      image: "/5k-running-race-beach.jpg",
      matched: false,
    },
    {
      id: "event3",
      title: "Tenis en Grupo",
      location: "Club Deportivo",
      date: "Mié, 20 Nov",
      distance: "3.1 km",
      pets: 6,
      image: "/tennis-group-game.jpg",
      matched: false,
    },
  ]

  const pets = [
    {
      id: "pet1",
      name: "Max",
      owner: "Juan",
      breed: "Golden Retriever",
      interests: ["Fútbol", "Playas"],
      image: "/golden-retriever-playing.png",
      age: 3,
      distance: "1.2 km",
    },
    {
      id: "pet2",
      name: "Luna",
      owner: "María",
      breed: "Husky",
      interests: ["Correr", "Montaña"],
      image: "/husky-running-mountain.jpg",
      age: 2,
      distance: "0.8 km",
    },
    {
      id: "pet3",
      name: "Buddy",
      owner: "Carlos",
      breed: "Labrador",
      interests: ["Tenis", "Agua"],
      image: "/labrador-playing-tennis.jpg",
      age: 4,
      distance: "1.5 km",
    },
  ]

  const users = [
    {
      id: "user1",
      name: "María González",
      age: 28,
      location: "Centro",
      distance: "555 m",
      petCount: 1,
      image: "/golden-retriever-playing.png",
    },
    {
      id: "user2",
      name: "Carlos Rodríguez",
      age: 32,
      location: "Candioti Sur",
      distance: "1.3 km",
      petCount: 2,
      image: "/husky-running-mountain.jpg",
    },
    {
      id: "user3",
      name: "Ana Silva",
      age: 25,
      location: "Barranquitas",
      distance: "1.7 km",
      petCount: 1,
      image: "/labrador-playing-tennis.jpg",
    },
  ]

  const matches = [
    {
      id: "match1",
      name: "María González",
      pet: "Golden Retriever",
      matchDate: "Hace 2 horas",
      image: "/golden-retriever-playing.png",
    },
    {
      id: "match2",
      name: "Carlos Ruiz",
      pet: "Senderismo",
      matchDate: "Hace 4 horas",
      image: "/husky-running-mountain.jpg",
    },
  ]

  const chats = [
    {
      id: "chat1",
      name: "María González",
      lastMessage: "¿Tu Max quiere jugar mañana?",
      time: "10:30",
      unread: 2,
      image: "/golden-retriever-playing.png",
    },
    {
      id: "chat2",
      name: "Carlos Ruiz",
      lastMessage: "Claro, nos vemos en el parque",
      time: "09:15",
      unread: 0,
      image: "/husky-running-mountain.jpg",
    },
  ]

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-primary to-primary/80 shadow-md border-b border-primary/20">
        <div className="max-w-screen-sm mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">🐾</span>
            </div>
            <h1 className="text-xl font-bold text-primary-foreground">SportPetMatch</h1>
          </div>
          <button className="relative w-10 h-10 rounded-full bg-secondary/30 hover:bg-secondary/40 transition-colors flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary-foreground" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-screen-sm mx-auto px-4 py-6">
        {/* HOME TAB */}
        {activeTab === "home" && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Acciones Rápidas</h2>
              <div className="grid grid-cols-2 gap-3">
                <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-14 rounded-lg flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  <span>Crear Evento</span>
                </Button>
                <div className="flex items-center gap-2 bg-muted rounded-lg px-4 border border-border">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="bg-transparent outline-none w-full text-sm placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </section>

            {/* Upcoming Events */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Eventos Próximos</h2>
                <span className="text-xs font-semibold bg-accent/20 text-accent-foreground px-2.5 py-1 rounded-full">
                  {events.length} eventos
                </span>
              </div>
              <div className="space-y-3">
                {events.map((event) => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-md transition-all border-border">
                    <div className="relative h-48 bg-muted overflow-hidden group">
                      <img
                        src={event.image || "/placeholder.svg"}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {event.matched && (
                        <div className="absolute top-3 right-3 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Flame className="w-3 h-3" /> ¡Match!
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <h3 className="font-bold text-white text-sm">{event.title}</h3>
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-primary" /> {event.location}
                        </span>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                          {event.distance}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5 inline mr-1 text-primary" /> {event.date}
                        </span>
                        <span className="text-xs font-semibold text-primary flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> {event.pets} mascotas
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Recent Matches */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Matches Recientes</h2>
                <span className="text-xs font-semibold bg-accent/20 text-accent-foreground px-2.5 py-1 rounded-full">
                  {matches.length} nuevos
                </span>
              </div>
              <div className="space-y-2">
                {matches.map((match) => (
                  <Card key={match.id} className="p-3 hover:shadow-md transition-all border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                          <img
                            src={match.image || "/placeholder.svg"}
                            alt={match.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground">{match.name}</p>
                          <p className="text-xs text-muted-foreground">{match.pet}</p>
                          <p className="text-xs text-muted-foreground">{match.matchDate}</p>
                        </div>
                      </div>
                      <Heart className="w-5 h-5 fill-secondary text-secondary flex-shrink-0" />
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* MATCHING TAB */}
        {activeTab === "matching" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Descubre Conexiones</h2>
            <div className="grid grid-cols-1 gap-4">
              {users.map((user) => (
                <Card key={user.id} className="overflow-hidden hover:shadow-lg transition-all border-border">
                  <div className="relative h-48 bg-muted">
                    <img
                      src={user.image || "/placeholder.svg"}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white text-lg font-bold">
                        {user.name}, {user.age}
                      </p>
                      <p className="text-white/90 text-sm flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {user.location} • {user.distance}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      <PawPrint className="w-4 h-4 inline mr-1 text-primary" />
                      {user.petCount} mascota{user.petCount > 1 ? "s" : ""}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 h-10 rounded-lg border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                      >
                        ✕ Pasar
                      </Button>
                      <Button className="flex-1 h-10 rounded-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                        ♡ Match
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* MAP TAB */}
        {activeTab === "map" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Mapa de SportPetMatch</h2>
            <Card className="p-8 text-center space-y-4 border-border">
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                <Map className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-semibold">Tu ubicación: Santa Fe Capital</p>
                <p className="text-muted-foreground text-sm mt-1">-31.6333, -60.7000</p>
              </div>
            </Card>
            <section className="space-y-3">
              <h3 className="font-bold text-foreground">Usuarios Cercanos ({users.length})</h3>
              {users.map((user) => (
                <Card
                  key={user.id}
                  className="p-3 flex items-center justify-between border-border hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                      <img
                        src={user.image || "/placeholder.svg"}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.age} años • {user.location}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full whitespace-nowrap ml-2">
                    {user.distance}
                  </span>
                </Card>
              ))}
            </section>
          </div>
        )}

        {/* PETS TAB */}
        {activeTab === "pets" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Mascotas Cerca</h2>
              <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {pets.map((pet) => (
                <Card key={pet.id} className="overflow-hidden hover:shadow-lg transition-all border-border">
                  <div className="relative h-40 bg-muted">
                    <img src={pet.image || "/placeholder.svg"} alt={pet.name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => toggleLike(pet.id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md hover:bg-secondary/10 transition-colors flex items-center justify-center"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          likes[pet.id] ? "fill-secondary text-secondary" : "text-muted-foreground"
                        }`}
                      />
                    </button>
                    <div className="absolute bottom-2 right-2 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                      {pet.distance}
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    <div>
                      <h3 className="font-bold text-foreground text-sm">{pet.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {pet.breed} • {pet.age} años
                      </p>
                      <p className="text-xs text-muted-foreground">Por {pet.owner}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {pet.interests.slice(0, 2).map((interest) => (
                        <span
                          key={interest}
                          className="text-xs bg-accent/30 text-accent-foreground px-2 py-0.5 rounded-full font-medium"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CHATS TAB */}
        {activeTab === "chats" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Mensajes</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar chat..."
                className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-lg border border-border text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              {chats.map((chat) => (
                <Card
                  key={chat.id}
                  className="p-3 hover:shadow-md transition-all cursor-pointer border-border hover:border-primary/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0 overflow-hidden">
                      <img
                        src={chat.image || "/placeholder.svg"}
                        alt={chat.name}
                        className="w-full h-full object-cover"
                      />
                      {chat.unread > 0 && (
                        <div className="absolute top-0 right-0 w-5 h-5 bg-secondary rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {chat.unread}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{chat.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{chat.time}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Mi Perfil</h2>
            <Card className="overflow-hidden border-border">
              <div className="h-32 bg-gradient-to-r from-primary to-secondary" />
              <div className="p-6 space-y-6 -mt-8">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary border-4 border-background flex-shrink-0" />
                  <div className="flex-1 pt-2">
                    <p className="text-lg font-bold text-foreground">Mi Mascota</p>
                    <p className="text-sm text-muted-foreground">Completa tu perfil</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-lg font-semibold">
                    Editar Perfil
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-lg border-border hover:bg-muted bg-transparent"
                  >
                    Ver Mi Mascota
                  </Button>
                </div>
              </div>
            </Card>
            <Card className="p-4 space-y-3 border-border">
              <h3 className="font-bold text-foreground">Configuración</h3>
              <div className="space-y-2 text-sm">
                <button className="w-full text-left text-foreground hover:text-primary transition-colors py-2">
                  Notificaciones
                </button>
                <button className="w-full text-left text-foreground hover:text-primary transition-colors py-2">
                  Privacidad
                </button>
                <button className="w-full text-left text-foreground hover:text-primary transition-colors py-2">
                  Ayuda y Soporte
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg">
        <div className="max-w-screen-sm mx-auto flex justify-around">
          {[
            { id: "home", label: "Inicio", icon: User },
            { id: "matching", label: "Matching", icon: Flame },
            { id: "map", label: "Mapa", icon: Map },
            { id: "pets", label: "Mascotas", icon: PawPrint },
            { id: "chats", label: "Chats", icon: MessageSquare },
            { id: "profile", label: "Perfil", icon: User },
          ].map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-2 text-center transition-all ${
                  activeTab === tab.id
                    ? "text-primary border-t-2 border-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <IconComponent className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs font-medium">{tab.label}</div>
              </button>
            )
          })}
        </div>
      </nav>
    </main>
  )
}
