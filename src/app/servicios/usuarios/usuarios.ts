import { Injectable } from '@angular/core';
import { supabase } from '../../../supabase.client';
import { Usuario } from '../../clases/usuario';

@Injectable({
  providedIn: 'root'
})
export class Usuarios {
  private table = "usuarios";

  async list(): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data ?? [];
  }

  async getById(id: number): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select("*")
      .eq("id", id)
      .single();
    
    if (error && error.code !== "PGRST116") throw error;
    return data ? this.mapFromDb(data) : null;
  }

  async getByEmail(email: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select("*")
      .eq("correo_electronico", email)
      .maybeSingle();
    
    if (error) throw error;
    return data ? this.mapFromDb(data) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const { count, error } = await supabase
      .from(this.table)
      .select("id", { count: "exact", head: true })
      .eq("correo_electronico", email);
    
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async createFromUser(usuario: Usuario): Promise<Usuario> {
    const row = this.mapToDb(usuario);
    
    const { data, error } = await supabase
      .from(this.table)
      .insert(row)
      .select("*")
      .single();

    if (error) throw error;
    return this.mapFromDb(data);
  }

  async update(id: number, patch: Partial<Usuario>): Promise<Usuario> {
    // Mapear los campos de TypeScript a PostgreSQL
    const updateData: any = { ...patch };
    
    if (updateData.email !== undefined) {
      updateData.correo_electronico = updateData.email;
      delete updateData.email;
    }

    if (updateData.nombre !== undefined) {
      updateData.name = updateData.nombre;
      delete updateData.nombre;
    }
    
    const { data, error } = await supabase
      .from(this.table)
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();
    
    if (error) throw error;
    return this.mapFromDb(data);
  }

  async remove(id: number): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  }

  // Mapper: PostgreSQL → TypeScript
  private mapFromDb(data: any): Usuario {
    return {
      id: data.id?.toString(), // Convertir a string si es necesario
      nombre: data.name,       // Tu tabla usa 'name', no 'nombre'
      email: data.correo_electronico
    } as Usuario;
  }

  // Mapper: TypeScript → PostgreSQL
private mapToDb(usuario: Usuario): any {
  const row: any = {
    name: usuario.nombre,
    correo_electronico: usuario.email
  };
  
  if (usuario.id) {
    row.user_id = usuario.id;
  }
  
    return row;
  }
}