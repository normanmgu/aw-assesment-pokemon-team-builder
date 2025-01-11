// hooks/useTeams.ts
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

interface Team {
  id: string;
  name: string;
  pokemon: Pokemon[];
}

export function useTeams() {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTeams = async () => {
    if (!session?.user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/teams');
      if (!response.ok) throw new Error('Failed to fetch teams');
      const data = await response.json();
      setTeams(data);
    } catch (err) {
      setError('Failed to load teams');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const createTeam = async (name: string, pokemon: Pokemon[]) => {
    if (!session?.user) return;
    
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pokemon }),
      });
      
      if (!response.ok) throw new Error('Failed to create team');
      const newTeam = await response.json();
      setTeams([...teams, newTeam]);
      return newTeam;
    } catch (err) {
      setError('Failed to create team');
      console.error(err);
    }
  };

  const updateTeam = async (teamId: string, name: string, pokemon: Pokemon[]) => {
    if (!session?.user) return;
    
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pokemon }),
      });
      
      if (!response.ok) throw new Error('Failed to update team');
      const updatedTeam = await response.json();
      setTeams(teams.map(team => 
        team.id === teamId ? updatedTeam : team
      ));
      return updatedTeam;
    } catch (err) {
      setError('Failed to update team');
      console.error(err);
    }
  };

  const deleteTeam = async (teamId: string) => {
    if (!session?.user) return;
    
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete team');
      setTeams(teams.filter(team => team.id !== teamId));
    } catch (err) {
      setError('Failed to delete team');
      console.error(err);
    }
  };

  return {
    teams,
    isLoading,
    setIsLoading,
    error,
    setError,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
  };
}