import { SimpleGrid } from '@metafam/ds';
import { PlayerTile } from 'components/Player/PlayerTile';
import { PlayerFragmentFragment } from 'graphql/autogen/types';
import React from 'react';

type Props = {
  players: PlayerFragmentFragment[];
  showSeasonalXP?: boolean;
};

export const PlayerList: React.FC<Props> = ({
  players,
  showSeasonalXP = false,
}) => (
  <SimpleGrid
    columns={[1, null, 2, 3]}
    spacing="8"
    autoRows="minmax(35rem, auto)"
  >
    {players.map((p) => (
      <PlayerTile key={p.username} player={p} showSeasonalXP={showSeasonalXP} />
    ))}
  </SimpleGrid>
);
