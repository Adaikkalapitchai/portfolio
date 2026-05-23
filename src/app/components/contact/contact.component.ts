import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;
  isSubmitted = false;
  showSuccessMessage = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  // Getter methods for easy access in the HTML template
  get name() { return this.contactForm.get('name'); }
  get email() { return this.contactForm.get('email'); }
  get message() { return this.contactForm.get('message'); }

  onSubmit(): void {
    this.isSubmitted = true;

    if (this.contactForm.valid) {
      // Simulate form submission
      console.log('Form Submitted successfully:', this.contactForm.value);
      this.showSuccessMessage = true;
      
      // Reset form state after brief interval
      setTimeout(() => {
        this.contactForm.reset();
        this.isSubmitted = false;
        this.showSuccessMessage = false;
      }, 5000);
    }
  }
}
