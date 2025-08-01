import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Route, 
  Plus,
  X,
  Grip,
  Target,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EventTemplate {
  id: string;
  type: 'running' | 'location' | 'time' | 'participants';
  title: string;
  icon: React.ReactNode;
  color: string;
  data?: any;
}

interface DroppedEvent {
  id: string;
  template: EventTemplate;
  position: { x: number; y: number };
  data: any;
}

interface DragDropEventCreatorProps {
  onEventCreate: (eventData: any) => void;
  isCreating?: boolean;
}

export default function DragDropEventCreator({ onEventCreate, isCreating = false }: DragDropEventCreatorProps) {
  const [droppedEvents, setDroppedEvents] = useState<DroppedEvent[]>([]);
  const [draggedTemplate, setDraggedTemplate] = useState<EventTemplate | null>(null);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    distance: "",
    maxParticipants: 15,
    isClubEvent: false,
    clubName: "",
    abilityLevels: [] as Array<"beginner" | "intermediate" | "advanced" | "all_welcome">,
    creatorComments: ""
  });
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const eventTemplates: EventTemplate[] = [
    {
      id: 'running-5k',
      type: 'running',
      title: '5K Run',
      icon: <Route className="h-5 w-5" />,
      color: 'bg-blue-500',
      data: { distance: '5K', type: 'run' }
    },
    {
      id: 'running-10k',
      type: 'running',
      title: '10K Run',
      icon: <Route className="h-5 w-5" />,
      color: 'bg-blue-600',
      data: { distance: '10K', type: 'run' }
    },
    {
      id: 'running-half',
      type: 'running',
      title: 'Half Marathon',
      icon: <Route className="h-5 w-5" />,
      color: 'bg-blue-700',
      data: { distance: 'Half Marathon', type: 'run' }
    },
    {
      id: 'location-park',
      type: 'location',
      title: 'Park Location',
      icon: <MapPin className="h-5 w-5" />,
      color: 'bg-green-500',
      data: { locationType: 'park' }
    },
    {
      id: 'location-track',
      type: 'location',
      title: 'Track Location',
      icon: <Target className="h-5 w-5" />,
      color: 'bg-green-600',
      data: { locationType: 'track' }
    },
    {
      id: 'time-morning',
      type: 'time',
      title: 'Morning (7:00 AM)',
      icon: <Clock className="h-5 w-5" />,
      color: 'bg-orange-500',
      data: { time: '07:00', period: 'morning' }
    },
    {
      id: 'time-evening',
      type: 'time',
      title: 'Evening (6:00 PM)',
      icon: <Clock className="h-5 w-5" />,
      color: 'bg-orange-600',
      data: { time: '18:00', period: 'evening' }
    },
    {
      id: 'participants-small',
      type: 'participants',
      title: 'Small Group (5-10)',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-purple-500',
      data: { maxParticipants: 10, groupSize: 'small' }
    },
    {
      id: 'participants-medium',
      type: 'participants',
      title: 'Medium Group (15-25)',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-purple-600',
      data: { maxParticipants: 25, groupSize: 'medium' }
    }
  ];

  const handleDragStart = (template: EventTemplate) => {
    setDraggedTemplate(template);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedTemplate || !dropZoneRef.current) return;

    const rect = dropZoneRef.current.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const newEvent: DroppedEvent = {
      id: `dropped-${Date.now()}`,
      template: draggedTemplate,
      position,
      data: { ...draggedTemplate.data }
    };

    setDroppedEvents(prev => [...prev, newEvent]);
    setDraggedTemplate(null);

    // Auto-fill form based on dropped template
    if (draggedTemplate.type === 'running') {
      setEventForm(prev => ({ ...prev, distance: draggedTemplate.data.distance }));
    } else if (draggedTemplate.type === 'time') {
      setEventForm(prev => ({ ...prev, time: draggedTemplate.data.time }));
    } else if (draggedTemplate.type === 'participants') {
      setEventForm(prev => ({ ...prev, maxParticipants: draggedTemplate.data.maxParticipants }));
    }

    toast({
      title: "Template Added",
      description: `${draggedTemplate.title} has been added to your event`,
    });
  }, [draggedTemplate, toast]);

  const handleRemoveDroppedEvent = (eventId: string) => {
    setDroppedEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const handleCreateEvent = () => {
    if (!eventForm.title || !eventForm.date || !eventForm.time || !eventForm.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (title, date, time, location)",
        variant: "destructive",
      });
      return;
    }

    // Combine form data with dropped template data
    const eventData = {
      ...eventForm,
      templates: droppedEvents.map(event => ({
        type: event.template.type,
        data: event.data
      })),
      // Ensure ability levels defaults to empty array if not set
      abilityLevels: eventForm.abilityLevels || []
    };

    onEventCreate(eventData);
    
    // Reset form and dropped events
    setDroppedEvents([]);
    setEventForm({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      distance: "",
      maxParticipants: 15,
      isClubEvent: false,
      clubName: "",
      abilityLevels: [] as Array<"beginner" | "intermediate" | "advanced" | "all_welcome">,
      creatorComments: ""
    });
  };

  const getCompletionStatus = () => {
    const hasRunning = droppedEvents.some(e => e.template.type === 'running');
    const hasLocation = droppedEvents.some(e => e.template.type === 'location') || eventForm.location;
    const hasTime = droppedEvents.some(e => e.template.type === 'time') || eventForm.time;
    const hasBasicInfo = eventForm.title && eventForm.date;
    
    return { hasRunning, hasLocation, hasTime, hasBasicInfo };
  };

  const completion = getCompletionStatus();
  const isComplete = completion.hasRunning && completion.hasLocation && completion.hasTime && completion.hasBasicInfo;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Template Library */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-orange-500" />
            Event Templates
          </CardTitle>
          <p className="text-sm text-gray-600">
            Drag templates to the canvas to build your event
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {eventTemplates.map((template) => (
              <motion.div
                key={template.id}
                className={`${template.color} text-white p-3 rounded-lg cursor-grab active:cursor-grabbing flex items-center gap-2 hover:shadow-md transition-shadow`}
                draggable
                onDragStart={() => handleDragStart(template)}
                whileHover={{ scale: 1.02 }}
                whileDrag={{ scale: 0.95 }}
              >
                <Grip className="h-4 w-4" />
                {template.icon}
                <span className="font-medium text-sm">{template.title}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Drop Zone Canvas */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              Event Canvas
            </div>
            <div className="flex items-center gap-2">
              {isComplete && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Ready to Create
                </Badge>
              )}
            </div>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Drop templates here to design your running event
          </p>
        </CardHeader>
        <CardContent>
          <div
            ref={dropZoneRef}
            className="relative min-h-[400px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-4"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {droppedEvents.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Drop event templates here</p>
                  <p className="text-sm">Start building your perfect running event</p>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {droppedEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    className={`absolute ${event.template.color} text-white p-3 rounded-lg shadow-lg cursor-move group`}
                    style={{
                      left: event.position.x,
                      top: event.position.y,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    drag
                    dragMomentum={false}
                    whileDrag={{ scale: 1.1, zIndex: 10 }}
                  >
                    <div className="flex items-center gap-2">
                      {event.template.icon}
                      <span className="font-medium text-sm">{event.template.title}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveDroppedEvent(event.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Event Form */}
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-lg">Event Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter event title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="Enter meeting location"
                  value={eventForm.location}
                  onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="distance">Distance</Label>
                <Select 
                  value={eventForm.distance} 
                  onValueChange={(value) => setEventForm(prev => ({ ...prev, distance: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select distance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1K">1K</SelectItem>
                    <SelectItem value="2K">2K</SelectItem>
                    <SelectItem value="3K">3K</SelectItem>
                    <SelectItem value="5K">5K</SelectItem>
                    <SelectItem value="8K">8K</SelectItem>
                    <SelectItem value="10K">10K</SelectItem>
                    <SelectItem value="15K">15K</SelectItem>
                    <SelectItem value="Half Marathon">Half Marathon (21K)</SelectItem>
                    <SelectItem value="Marathon">Marathon (42K)</SelectItem>
                    <SelectItem value="Trail Run">Trail Run</SelectItem>
                    <SelectItem value="Fun Run">Fun Run</SelectItem>
                    <SelectItem value="Other">Other Distance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  max="100"
                  value={eventForm.maxParticipants}
                  onChange={(e) => setEventForm(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 15 }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell people about your running event..."
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Club Event Fields */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isClubEvent"
                checked={eventForm.isClubEvent}
                onChange={(e) => setEventForm(prev => ({ ...prev, isClubEvent: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isClubEvent">This is a club event</Label>
            </div>

            {eventForm.isClubEvent && (
              <div>
                <Label htmlFor="clubName">Club Name</Label>
                <Input
                  id="clubName"
                  placeholder="Enter your running club name..."
                  value={eventForm.clubName}
                  onChange={(e) => setEventForm(prev => ({ ...prev, clubName: e.target.value }))}
                />
              </div>
            )}

            {/* Ability Levels */}
            <div>
              <Label>Ability Levels Welcome</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { value: "beginner", label: "Beginner" },
                  { value: "intermediate", label: "Intermediate" },
                  { value: "advanced", label: "Advanced" },
                  { value: "all_welcome", label: "All Welcome" }
                ].map((level) => (
                  <div key={level.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`ability-${level.value}`}
                      checked={eventForm.abilityLevels.includes(level.value as "beginner" | "intermediate" | "advanced" | "all_welcome")}
                      onChange={(e) => {
                        const currentLevels = eventForm.abilityLevels;
                        if (e.target.checked) {
                          setEventForm(prev => ({ 
                            ...prev, 
                            abilityLevels: [...currentLevels, level.value as "beginner" | "intermediate" | "advanced" | "all_welcome"] 
                          }));
                        } else {
                          setEventForm(prev => ({ 
                            ...prev, 
                            abilityLevels: currentLevels.filter(l => l !== level.value) 
                          }));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`ability-${level.value}`} className="text-sm">
                      {level.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Creator Comments */}
            <div>
              <Label htmlFor="creatorComments">Additional Comments</Label>
              <Textarea
                id="creatorComments"
                placeholder="Add route info, meeting points, what to bring, special instructions..."
                value={eventForm.creatorComments}
                onChange={(e) => setEventForm(prev => ({ ...prev, creatorComments: e.target.value }))}
                rows={2}
              />
            </div>

            <Button 
              onClick={handleCreateEvent}
              disabled={!isComplete || isCreating}
              className="w-full bg-orange-500 hover:bg-orange-600"
              size="lg"
            >
              {isCreating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Route className="h-4 w-4" />
                  </motion.div>
                  Creating Event...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Create Running Event
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}