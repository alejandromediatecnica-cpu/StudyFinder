import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { StudyDataService } from '../../../services/study-data.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class MainComponent {
  user;
  stats;

  constructor(private authService: AuthService, private studyData: StudyDataService) {
    this.user = this.authService.getUser();
    this.studyData.recordSession();
    this.stats = this.studyData.getStats();
  }
}