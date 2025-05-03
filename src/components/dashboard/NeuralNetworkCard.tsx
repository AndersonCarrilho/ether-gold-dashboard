
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network } from "lucide-react";

const NeuralNetworkCard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Neural network visualization
    const nodes: Node[] = [];
    const connections: Connection[] = [];
    const numNodes = 12;
    
    class Node {
      x: number;
      y: number;
      radius: number;
      pulseSpeed: number;
      pulsePhase: number;
      color: string;
      
      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.radius = 4;
        this.pulseSpeed = 0.03 + Math.random() * 0.02;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.color = 'rgba(212, 175, 55, 0.7)';
      }
      
      update() {
        this.pulsePhase += this.pulseSpeed;
        const pulseFactor = 0.5 * Math.sin(this.pulsePhase) + 1;
        this.radius = 3 + pulseFactor;
      }
      
      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx!.fillStyle = this.color;
        ctx!.fill();
      }
    }
    
    class Connection {
      from: Node;
      to: Node;
      strength: number;
      activeTime: number;
      duration: number;
      active: boolean;
      
      constructor(from: Node, to: Node) {
        this.from = from;
        this.to = to;
        this.strength = 0.1 + Math.random() * 0.5;
        this.activeTime = 0;
        this.duration = 30 + Math.random() * 30;
        this.active = false;
      }
      
      update() {
        if (this.active) {
          this.activeTime++;
          if (this.activeTime > this.duration) {
            this.active = false;
            this.activeTime = 0;
          }
        } else if (Math.random() < 0.005) {
          this.active = true;
        }
      }
      
      draw() {
        if (!this.active) return;
        
        const progress = this.activeTime / this.duration;
        const pulsePosition = progress;
        
        // Draw base line
        ctx!.beginPath();
        ctx!.moveTo(this.from.x, this.from.y);
        ctx!.lineTo(this.to.x, this.to.y);
        ctx!.strokeStyle = `rgba(212, 175, 55, ${this.strength * 0.3})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
        
        // Draw pulse moving along the line
        const pulseX = this.from.x + (this.to.x - this.from.x) * pulsePosition;
        const pulseY = this.from.y + (this.to.y - this.from.y) * pulsePosition;
        
        ctx!.beginPath();
        ctx!.arc(pulseX, pulseY, 2, 0, Math.PI * 2);
        ctx!.fillStyle = 'rgba(255, 215, 0, 0.9)';
        ctx!.fill();
      }
    }
    
    // Initialize nodes in a network structure
    function initNetwork() {
      // Clear previous nodes
      nodes.length = 0;
      connections.length = 0;
      
      // Create input nodes (layer 1)
      for (let i = 0; i < 4; i++) {
        nodes.push(new Node(
          canvas.width * 0.2,
          canvas.height * (0.2 + i * 0.2)
        ));
      }
      
      // Create hidden nodes (layer 2)
      for (let i = 0; i < 4; i++) {
        nodes.push(new Node(
          canvas.width * 0.5,
          canvas.height * (0.2 + i * 0.2)
        ));
      }
      
      // Create output nodes (layer 3)
      for (let i = 0; i < 4; i++) {
        nodes.push(new Node(
          canvas.width * 0.8,
          canvas.height * (0.2 + i * 0.2)
        ));
      }
      
      // Create connections between layers
      for (let i = 0; i < 4; i++) {
        for (let j = 4; j < 8; j++) {
          connections.push(new Connection(nodes[i], nodes[j]));
        }
      }
      
      for (let i = 4; i < 8; i++) {
        for (let j = 8; j < 12; j++) {
          connections.push(new Connection(nodes[i], nodes[j]));
        }
      }
    }
    
    function animate() {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw connections
      connections.forEach(connection => {
        connection.update();
        connection.draw();
      });
      
      // Update and draw nodes
      nodes.forEach(node => {
        node.update();
        node.draw();
      });
      
      requestAnimationFrame(animate);
    }
    
    // Handle resize
    const handleResize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      initNetwork();
    };
    
    window.addEventListener('resize', handleResize);
    initNetwork();
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <Card className="card-hover h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Network className="h-4 w-4 mr-2 text-gold" />
          Neural Network Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[260px]">
        <div className="relative w-full h-full">
          <canvas ref={canvasRef} className="absolute inset-0" />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Live Network Analysis
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NeuralNetworkCard;
