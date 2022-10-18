import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pessoa } from '../models/Pessoa';

@Injectable()
export class PessoaService {
  pessoaApiURL = 'https://localhost:7029/Pessoa';
  constructor(private http: HttpClient) {}

  getPessoas(): Observable<Pessoa[]> {
    return this.http.get<Pessoa[]>(this.pessoaApiURL);
  }

  createPessoa(pessoa: Pessoa): Observable<Pessoa> {
    return this.http.post<Pessoa>(this.pessoaApiURL, pessoa);
  }

  editPessoa(pessoa: Pessoa): Observable<Pessoa> {
    return this.http.put<Pessoa>(
      `${this.pessoaApiURL}?id=${pessoa.pessoaId}`,
      pessoa
    );
  }

  deletePessoa(id: number): Observable<any> {
    return this.http.delete<any>(`${this.pessoaApiURL}?id=${id}`);
  }
}
