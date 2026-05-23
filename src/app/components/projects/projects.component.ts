import { Component, OnInit } from '@angular/core';

interface Project {
  title: string;
  description: string;
  category: 'angular' | 'ui';
  tags: string[];
  githubUrl: string;
  liveUrl: string;
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  activeFilter: 'all' | 'angular' | 'ui' = 'all';

  projects: Project[] = [
    {
      title: 'FPX Library (Fintech UI Framework)',
      description: 'Designed and implemented reusable NPM component libraries and backend-driven configuration systems, improving UI consistency and minimizing duplicate code by 50%.',
      category: 'angular',
      tags: ['Angular v14', 'RxJS', 'NgRx', 'd3.js', 'SCSS', 'Component Library', 'Backend-Driven Configuration', 'Enterprise Banking Products', 'NPM Component Library', 'Angular Material', 'PrimeNG'],
      githubUrl: 'https://github.com/Adaikkalapitchai',
      liveUrl: 'https://angular.io'
    },
    {
      title: 'Pulse – BaaS Platform (API Monetization & Billing)',
      description: 'Developed and scaled a BaaS platform supporting API monetization and billing workflows across multiple enterprise banking products.',
      category: 'angular',
      tags: ['Angular', 'TypeScript', 'RxJS State', 'CSS Grid', 'REST APIs', 'BaaS', 'API Monetization', 'Billing Workflows', 'NPM Component Library', 'Backend-Driven Configuration', 'Enterprise Banking Products'],
      githubUrl: 'https://github.com/Adaikkalapitchai',
      liveUrl: 'https://angular.io'
    },
    {
      title: 'API Exchange – Consumer API Portal',
      description: 'Engineered a full stack API marketplace platform supporting API discovery, access control, and subscription workflows',
      category: 'ui',
      tags: ['HTML5', 'Design System', 'Accessibility', 'Backend-Driven Authorization Logic', 'Role-Based Access Systems', 'Payload Encryption', 'Consumer Portal', 'Js Obfuscation', 'ui-ux', 'UX design'],
      githubUrl: 'https://github.com/Adaikkalapitchai',
      liveUrl: 'https://angular.io'
    },
    {
      title: 'IRMS Medical Billing App',
      description: 'Developed a secure IRMS medical billing application for a Dubai-based client, integrating automated claims process-ing and ensuring compliance with regional healthcare data regulations.',
      category: 'angular',
      tags: ['TypeScript', 'Angular 14', 'PHP', 'Xampp', 'MySQL', 'Bootstrap', 'Rest API', 'AG-Grid', 'Angular Material', 'Routing', 'Security'],
      githubUrl: 'https://github.com/Adaikkalapitchai',
      liveUrl: 'https://angular.io'
    },
    {
      title: 'Liqour Billing and Stocks',
      description: 'Built a scalable inventory and liquor billing application for the Andhra Pradesh government using Angular 14, focusing on modular architecture and reusable component patterns to handle real-time stock updates and high-volume daily transactions',
      category: 'angular',
      tags: ['TypeScript', 'Angular 14', 'PHP', 'Xampp', 'MySQL', 'Bootstrap', 'Rest API', 'AG-Grid', 'Angular Material', 'Routing', 'Security'],
      githubUrl: 'https://github.com/Adaikkalapitchai',
      liveUrl: 'https://angular.io'
    }
  ];

  filteredProjects: Project[] = [];

  constructor() { }

  ngOnInit(): void {
    this.filterProjects('all');
  }

  filterProjects(filter: 'all' | 'angular' | 'ui'): void {
    this.activeFilter = filter;
    if (filter === 'all') {
      this.filteredProjects = this.projects;
    } else {
      this.filteredProjects = this.projects.filter(p => p.category === filter);
    }
  }
}
