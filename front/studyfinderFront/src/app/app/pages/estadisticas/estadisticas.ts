import { Component } from '@angular/core';
import { StudyDataService } from '../../../services/study-data.service';

@Component({
  standalone: true,
  selector: 'app-estadisticas',
  imports: [],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class EstadisticasComponent {
  stats;

  constructor(private studyData: StudyDataService) {
    this.stats = studyData.getStats();
  }
}
