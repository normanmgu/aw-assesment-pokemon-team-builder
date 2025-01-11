"use client";

import React, { useState, useEffect } from "react";
import { useTeams } from "@/hooks/useTeams";
import { Search, X, Save, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Header } from "../components/Header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

const PokemonTeamBuilder = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState<Pokemon | null>(null);
  const [team, setTeam] = useState<Pokemon[]>([]);
  const [teamName, setTeamName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const {
    teams,
    isLoading,
    error,
    setError,
    setIsLoading,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
  } = useTeams();

  useEffect(() => {
    fetchTeams();
  }, []);

  const searchPokemon = async () => {
    if (!searchTerm) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`
      );
      if (!response.ok) {
        throw new Error("Pokemon not found");
      }
      const data = await response.json();
      setSearchResult({
        name: data.name,
        sprite: data.sprites.front_default,
        types: data.types.map(
          (type: { type: { name: string } }) => type.type.name
        ),
        id: data.id,
      });
    } catch (error) {
      console.error("Error searching Pokemon:", error);
      setError("Pokemon not found. Please check the spelling and try again.");
      setSearchResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const addToTeam = (pokemon: Pokemon) => {
    if (team.length >= 6) {
      setError("Team is full! Remove a Pokemon first.");
      return;
    }
    if (team.some((p) => p.id === pokemon.id)) {
      setError("This Pokemon is already in your team!");
      return;
    }
    setTeam([...team, pokemon]);
    setSearchResult(null);
    setSearchTerm("");
    setError("");
  };

  const removePokemon = (pokemonId: number) => {
    setTeam(team.filter((p) => p.id !== pokemonId));
  };

  const handleSaveTeam = async () => {
    if (!teamName) {
      setError("Please enter a team name");
      return;
    }

    try {
      if (editingTeamId) {
        await updateTeam(editingTeamId, teamName, team);
      } else {
        await createTeam(teamName, team);
      }
      setTeamName("");
      setTeam([]);
      setEditingTeamId(null);
      setIsDialogOpen(false);
      fetchTeams();
    } catch (error) {
      setError("Failed to save team");
    }
  };

  const handleEditTeam = (teamId: string) => {
    const teamToEdit = teams.find((t) => t.id === teamId);
    if (teamToEdit) {
      setTeam(teamToEdit.pokemon);
      setTeamName(teamToEdit.name);
      setEditingTeamId(teamId);
    }
  };

  const handleLoadTeam = (teamId: string) => {
    const selectedTeam = teams.find((t) => t.id === teamId);
    if (selectedTeam) {
      setTeam(selectedTeam.pokemon);
      setTeamName(selectedTeam.name);
      setSelectedTeam(teamId);
      setEditingTeamId(teamId);
    }
  };

  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-2xl">Pokemon Team Builder</CardTitle>
            <div className="flex gap-2">
              {teams.length > 0 && (
                <Select
                  value={selectedTeam || ""}
                  onValueChange={handleLoadTeam}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Load team..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {/* Create New Team Dialog */}
              <Dialog
                open={isDialogOpen && !editingTeamId}
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) setEditingTeamId(null);
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setEditingTeamId(null)}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create New Team
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      placeholder="Enter team name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                    <Button onClick={handleSaveTeam} className="w-full">
                      Create Team
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              {/* Update Team Dialog */}
              {selectedTeam && team.length > 0 && (
                <Dialog
                  open={isDialogOpen && editingTeamId}
                  onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) setEditingTeamId(null);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setEditingTeamId(selectedTeam)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Update Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Team</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input
                        placeholder="Enter team name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                      />
                      <Button onClick={handleSaveTeam} className="w-full">
                        Update Team
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Pokemon by name..."
                  onKeyDown={(e) => e.key === "Enter" && searchPokemon()}
                  className="pl-8"
                />
              </div>
              <Button
                onClick={searchPokemon}
                disabled={isLoading}
                className="w-24"
              >
                {isLoading ? "Loading..." : "Search"}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Search Results */}
            <div className="mb-8 space-y-4">
              {searchResult && (
                <Card key={searchResult.id}>
                  <CardContent className="flex items-center gap-4 pt-6">
                    <img
                      src={searchResult.sprite}
                      alt={searchResult.name}
                      className="w-16 h-16"
                    />
                    <div className="flex-grow">
                      <h3 className="capitalize text-lg font-semibold">
                        {searchResult.name}
                      </h3>
                      <div className="flex gap-2">
                        {searchResult.types.map((type) => (
                          <span
                            key={type}
                            className="px-2 py-1 rounded-full text-sm bg-secondary capitalize"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => addToTeam(searchResult)}
                      variant="secondary"
                    >
                      Add to Team
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Team Display */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Your Team ({team.length}/6)
                </h2>
                {selectedTeam && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTeam(selectedTeam)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        deleteTeam(selectedTeam);
                        setSelectedTeam(null);
                        setTeam([]);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {team.map((pokemon) => (
                  <Card key={pokemon.id} className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removePokemon(pokemon.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <CardContent className="pt-6 flex flex-col items-center">
                      <img
                        src={pokemon.sprite}
                        alt={pokemon.name}
                        className="w-24 h-24"
                      />
                      <h3 className="capitalize font-semibold">
                        {pokemon.name}
                      </h3>
                      <div className="flex gap-1 flex-wrap justify-center mt-2">
                        {pokemon.types.map((type) => (
                          <span
                            key={type}
                            className="px-2 py-1 rounded-full text-xs bg-secondary capitalize"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {[...Array(6 - team.length)].map((_, i) => (
                  <Card
                    key={i}
                    className="flex items-center justify-center p-6"
                  >
                    <span className="text-muted-foreground">Empty Slot</span>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PokemonTeamBuilder;
