import { Pipe, PipeTransform } from '@angular/core';

interface Note {
  id: string;
  name: string;
  family: string;
  intensity: number;
}

@Pipe({
  name: 'filterByFamily',
  standalone: true
})
export class FilterByFamilyPipe implements PipeTransform {
  transform(notes: Note[], family: string): Note[] {
    if (!notes || !family) {
      return notes;
    }
    return notes.filter(note => note.family === family);
  }
}