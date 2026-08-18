import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario.html',
  styleUrl: './calendario.css',
})
export class CalendarioComponent {

  currentDate = new Date();

  selectedDay = new Date();

  calendarDays: Date[] = [];

  readonly weekDays = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo'
  ];

  readonly months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];

  events = [
    {
      title: 'Taller Álgebra',
      description: 'Documento PDF',
      date: new Date(2026, 8, 2),
      hour: '8:00 AM',
      color: 'document'
    },
    {
      title: 'Entrega Física',
      description: 'Prioridad Alta',
      date: new Date(2026, 8, 3),
      hour: '2:00 PM',
      color: 'homework'
    },
    {
      title: 'Repasar Programación',
      description: 'Angular',
      date: new Date(2026, 8, 3),
      hour: '6:00 PM',
      color: 'class'
    }
  ];

  constructor() {
    this.generateCalendar();
  }

  get currentMonthName(): string {
    return this.months[this.currentDate.getMonth()];
  }

  get currentYear(): number {
    return this.currentDate.getFullYear();
  }

  previousMonth(): void {

    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );

    this.generateCalendar();

  }

  nextMonth(): void {

    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );

    this.generateCalendar();

  }

  goToday(): void {

    this.currentDate = new Date();

    this.selectedDay = new Date();

    this.generateCalendar();

  }

  selectDay(day: Date): void {

    this.selectedDay = day;

  }

  getEvents(day: Date) {

    return this.events.filter(event =>
      event.date.getDate() === day.getDate() &&
      event.date.getMonth() === day.getMonth() &&
      event.date.getFullYear() === day.getFullYear()
    );

  }

  isSelected(day: Date): boolean {

    return day.toDateString() === this.selectedDay.toDateString();

  }

  isCurrentMonth(day: Date): boolean {

    return day.getMonth() === this.currentDate.getMonth();

  }

  private generateCalendar(): void {

    this.calendarDays = [];

    const firstDay = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      1
    );

    let startDay = firstDay.getDay();

    startDay = startDay === 0 ? 6 : startDay - 1;

    const startDate = new Date(firstDay);

    startDate.setDate(firstDay.getDate() - startDay);

    for (let i = 0; i < 42; i++) {

      const day = new Date(startDate);

      day.setDate(startDate.getDate() + i);

      this.calendarDays.push(day);

    }

  }

}