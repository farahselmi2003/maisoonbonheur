import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JsonServerService } from '../../services/json-server';
import { CartService } from '../../services/cart.service';

interface Note {
  id: string;
  name: string;
  family: string;
  intensity: number;
  description?: string;
  icon?: string;
  price?: number;
}

@Component({
  selector: 'app-creator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './creator.component.html',
  styleUrls: ['./creator.component.scss']
})
export class CreatorComponent implements OnInit {

  availableNotes: Note[] = [
    { id: '1', name: 'Rose', family: 'Floral', intensity: 8, description: 'Note florale délicate', icon: '🌹', price: 18 },
    { id: '2', name: 'Jasmin', family: 'Floral', intensity: 7, description: 'Note florale envoûtante', icon: '🌸', price: 20 },
    { id: '3', name: 'Santal', family: 'Boisé', intensity: 9, description: 'Note boisée chaude', icon: '🌳', price: 25 },
    { id: '4', name: 'Cèdre', family: 'Boisé', intensity: 6, description: 'Note boisée noble', icon: '🪵', price: 22 },
    { id: '5', name: 'Bergamote', family: 'Fruité', intensity: 5, description: 'Note fraîche et acidulée', icon: '🍋', price: 15 },
    { id: '6', name: 'Vanille', family: 'Gourmand', intensity: 7, description: 'Note gourmande et douce', icon: '🍦', price: 22 },
    { id: '7', name: 'Citron', family: 'Frais', intensity: 4, description: 'Note fraîche et énergisante', icon: '🍊', price: 14 },
    { id: '8', name: 'Ambre', family: 'Oriental', intensity: 9, description: 'Note orientale sensuelle', icon: '🟫', price: 28 },
    { id: '9', name: 'Lavande', family: 'Frais', intensity: 5, description: 'Note herbacée apaisante', icon: '🌿', price: 12 },
    { id: '10', name: 'Musc', family: 'Oriental', intensity: 6, description: 'Note animale enveloppante', icon: '⚪', price: 24 }
  ];

  selectedNotes: Note[] = [];
  maxNotes = 5;
  loading = false;
  message = '';


  currentSeason: string = '';
  currentMood: string = '';
  averageIntensity: number = 0;
  creationPrice: number = 0;

  constructor(
    private jsonServerService: JsonServerService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updatePreview();
  }

  toggleNoteSelection(note: Note) {
    const exists = this.selectedNotes.find(n => n.id === note.id);

    if (exists) {
      this.selectedNotes = this.selectedNotes.filter(n => n.id !== note.id);
      this.showMessage('Note retirée', 'success');
    } else if (this.selectedNotes.length < this.maxNotes) {
      this.selectedNotes.push(note);
      this.showMessage('Note ajoutée', 'success');
    } else {
      this.showMessage(`❗ Vous pouvez sélectionner jusqu'à ${this.maxNotes} notes maximum.`, 'warning');
    }
    
    this.updatePreview();
  }

  isSelected(note: Note): boolean {
    return this.selectedNotes.some(n => n.id === note.id);
  }

  get families() {
    return Array.from(new Set(this.availableNotes.map(n => n.family)));
  }

  updatePreview() {
    this.currentSeason = this.determineSeason();
    this.currentMood = this.determineMood();
    this.averageIntensity = this.getAverageIntensity();
    this.creationPrice = this.calculateCreationPrice();
  }

  private determineSeason(): string {
    if (this.selectedNotes.length === 0) return '';
    
    const floralCount = this.selectedNotes.filter(n => n.family === 'Floral').length;
    const freshCount = this.selectedNotes.filter(n => n.family === 'Frais').length;
    const woodyCount = this.selectedNotes.filter(n => n.family === 'Boisé').length;
    const orientalCount = this.selectedNotes.filter(n => n.family === 'Oriental').length;
    const fruityCount = this.selectedNotes.filter(n => n.family === 'Fruité').length;
    const gourmandCount = this.selectedNotes.filter(n => n.family === 'Gourmand').length;

    if (floralCount > 0 && freshCount > 0) return 'Printemps';
    if (freshCount > 0 && fruityCount > 0) return 'Été';
    if (woodyCount > 0 && orientalCount > 0) return 'Automne';
    if (woodyCount > 0 && gourmandCount > 0) return 'Hiver';
    if (floralCount > 0) return 'Printemps';
    if (freshCount > 0) return 'Été';
    if (woodyCount > 0) return 'Automne';
    
    return 'Toutes saisons';
  }

  private determineMood(): string {
    if (this.selectedNotes.length === 0) return '';
    
    const avgIntensity = this.getAverageIntensity();
    
    if (avgIntensity >= 8) return 'Intense & Sensuel';
    if (avgIntensity >= 6) return 'Élégant & Sophistiqué';
    if (avgIntensity >= 4) return 'Romantique & Doux';
    return 'Frais & Léger';
  }

  private getAverageIntensity(): number {
    if (this.selectedNotes.length === 0) return 0;
    return this.selectedNotes.reduce((total, note) => total + note.intensity, 0) / this.selectedNotes.length;
  }


  saveAndAddToCart() {
    if (this.selectedNotes.length === 0) {
      this.showMessage('⚠️ Veuillez sélectionner au moins une note.', 'warning');
      return;
    }

    this.loading = true;
    this.showMessage('Création de votre parfum en cours...', 'info');


    const creationId = Date.now().toString();
    const creationName = this.generateCreationName();
    const creationPrice = this.calculateCreationPrice();

    const creation: any = {
      id: creationId,
      created_at: new Date().toISOString(),
      notes: this.selectedNotes.map(n => n.name),
      note_objects: this.selectedNotes, 
      families: Array.from(new Set(this.selectedNotes.map(n => n.family))),
      intensity: Math.round(this.getAverageIntensity()),
      season: this.currentSeason,
      mood: this.currentMood,
      name: creationName,
      price: creationPrice,
      image_url: '/assets/images/parfume.webp',
      brand: 'Votre Création',
      is_custom: true,
      description: this.generateCreationDescription()
    };

   
    try {
      this.jsonServerService.addCreation(creation).subscribe({
        next: () => {
          this.handleCreationSuccess(creation);
        },
        error: (err) => {
          console.error('Erreur avec JSON Server, utilisation du localStorage:', err);
          this.handleCreationFallback(creation);
        }
      });
    } catch (error) {
      console.error('Erreur générale, utilisation du localStorage:', error);
      this.handleCreationFallback(creation);
    }
  }

  private handleCreationSuccess(creation: any) {

    this.saveToLocalStorage(creation);
    

    this.addCreationToCart(creation);
    
    this.loading = false;
    this.showMessage('✅ Votre création a été enregistrée et ajoutée au panier !', 'success');
    
   
    setTimeout(() => {
      this.router.navigate(['/cart']);
    }, 2000);
  }

  private handleCreationFallback(creation: any) {
   
    this.saveToLocalStorage(creation);
    
 
    this.addCreationToCart(creation);
    
    this.loading = false;
    this.showMessage('✅ Votre création a été enregistrée et ajoutée au panier !', 'success');
    
  
    setTimeout(() => {
      this.router.navigate(['/cart']);
    }, 2000);
  }

 
  private addCreationToCart(creation: any) {
    const cartItem = {
      id: creation.id,
      name: creation.name,
      price: creation.price,
      image_url: creation.image_url,
      quantity: 1,
      is_custom: true,
      custom_notes: creation.notes,
      custom_note_objects: creation.note_objects,
      custom_season: creation.season,
      custom_mood: creation.mood,
      custom_intensity: creation.intensity,
      custom_description: creation.description
    };

    this.cartService.addToCart(cartItem);
    console.log('Création ajoutée au panier:', cartItem);
  }


  private generateCreationName(): string {
    if (this.selectedNotes.length === 0) return 'Parfum Unique';
    
    const mainNote = this.selectedNotes[0].name;
    const mood = this.currentMood.split(' ')[0];
    const season = this.currentSeason.toLowerCase();
    
    const names = [
      `Élixir ${mainNote}`,
      `Essence ${mood}`,
      `Parfum ${mainNote} ${mood}`,
      `Création ${this.currentSeason}`,
      `Sérum ${mainNote}`,
      `Fragrance ${mood}`,
      `Nectar ${mainNote}`,
      `Extrait ${this.currentSeason}`
    ];
    
    return names[Math.floor(Math.random() * names.length)];
  }


  private generateCreationDescription(): string {
    if (this.selectedNotes.length === 0) return 'Votre création personnalisée';
    
    const notesList = this.selectedNotes.map(note => note.name.toLowerCase()).join(', ');
    return `Une fragrance ${this.currentMood.toLowerCase()} aux notes de ${notesList}. Parfait pour la saison ${this.currentSeason.toLowerCase()}.`;
  }


  private calculateCreationPrice(): number {
    const basePrice = 80;
    const notesPrice = this.selectedNotes.reduce((total, note) => total + (note.price || 15), 0);
    const intensityMultiplier = this.getAverageIntensity() > 7 ? 1.2 : 1;
    
    return Math.round((basePrice + notesPrice) * intensityMultiplier);
  }

 
  private saveToLocalStorage(creation: any) {
    try {
      const existingCreations = JSON.parse(localStorage.getItem('perfumeCreations') || '[]');
      existingCreations.push(creation);
      localStorage.setItem('perfumeCreations', JSON.stringify(existingCreations));
      console.log('Création sauvegardée dans localStorage:', creation);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde dans localStorage:', error);
    }
  }


  private showMessage(text: string, type: 'success' | 'warning' | 'info' | 'error') {
    this.message = text;
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }

  
  getMessageClass(): string {
    if (this.message.includes('✅') || this.message.includes('🛒')) return 'success';
    if (this.message.includes('❌') || this.message.includes('⚠️') || this.message.includes('❗')) return 'warning';
    if (this.message.includes('Création') || this.message.includes('Ajout')) return 'info';
    return 'info';
  }

  getSeasonClass(): string {
    const season = this.currentSeason.toLowerCase();
    if (season.includes('printemps')) return 'spring';
    if (season.includes('été')) return 'summer';
    if (season.includes('automne')) return 'autumn';
    if (season.includes('hiver')) return 'winter';
    return 'all-seasons';
  }

  getIntensityClass(): string {
    if (this.averageIntensity >= 7) return 'high';
    if (this.averageIntensity >= 4) return 'medium';
    return 'low';
  }


  getNotesByFamily(family: string): Note[] {
    return this.availableNotes.filter(note => note.family === family);
  }


  removeNote(note: Note) {
    this.toggleNoteSelection(note);
  }


  resetSelection() {
    this.selectedNotes = [];
    this.updatePreview();
    this.showMessage('Sélection réinitialisée', 'info');
  }
}