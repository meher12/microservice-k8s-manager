import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Importer HttpClientModule
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment.prod'; // Importer l'environnement

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // Ajouter HttpClientModule aux imports
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  products: any[] = [];
  orders: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getProducts();
    this.getOrders();
  }

  getProducts() {
    this.http.get(`${environment.apiUrl}/api/products`).subscribe((data: any) => {
      this.products = data;
    }, error => {
      console.error('There was an error!', error);
    });
  }

  getOrders() {
    this.http.get(`${environment.apiUrl}/api/orders`).subscribe((data: any) => {
      this.orders = data;
    }, error => {
      console.error('There was an error!', error);
    });
  }

  placeOrder(productId: number) {
    const order = { productId, quantity: 1 };
    this.http.post(`${environment.apiUrl}/api/orders`, order).subscribe(() => {
      this.getOrders();
    }, error => {
      console.error('There was an error!', error);
    });
  }
}
