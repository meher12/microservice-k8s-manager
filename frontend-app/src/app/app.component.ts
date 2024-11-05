import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Importer HttpClientModule
import { CommonModule } from '@angular/common';

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
    this.http.get('/api/products').subscribe((data: any) => {
      this.products = data;
    });
  }

  getOrders() {
    this.http.get('/api/orders').subscribe((data: any) => {
      this.orders = data;
    });
  }

  placeOrder(productId: number) {
    const order = { productId, quantity: 1 };
    this.http.post('/api/orders', order).subscribe(() => {
      this.getOrders();
    });
  }
}
