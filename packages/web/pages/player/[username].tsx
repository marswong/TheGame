import { Box, Flex, LoadingState } from '@metafam/ds';
import { PlayerHero } from 'components/Player/Section/PlayerHero';
import { useInsertCacheInvalidationMutation } from 'graphql/autogen/types';
import { getPlayer } from 'graphql/getPlayer';
import { getTopPlayerUsernames } from 'graphql/getPlayers';
import { useUser, useWeb3 } from 'lib/hooks';
import {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next';
import Error from 'next/error';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { BOX_TYPE } from 'utils/boxTypes';
import {
  getPlayerCoverImageFull,
  getPlayerDescription,
  getPlayerImage,
} from 'utils/playerHelpers';

import { PageContainer } from '../../components/Container';
import { PlayerAchievements } from '../../components/Player/Section/PlayerAchievements';
import { PlayerAddSection } from '../../components/Player/Section/PlayerAddSection';
import { PlayerColorDisposition } from '../../components/Player/Section/PlayerColorDisposition';
import { PlayerGallery } from '../../components/Player/Section/PlayerGallery';
import { PlayerMemberships } from '../../components/Player/Section/PlayerMemberships';
import { PlayerRoles } from '../../components/Player/Section/PlayerRoles';
import { PlayerSkills } from '../../components/Player/Section/PlayerSkills';
import { PlayerType } from '../../components/Player/Section/PlayerType';
import { HeadComponent } from '../../components/Seo';

type Props = InferGetStaticPropsType<typeof getStaticProps>;

const PlayerPage: React.FC<Props> = ({ player }) => {
  const router = useRouter();

  const [boxAvailableList, setBoxAvailableList] = useState<string[]>([]);
  const [canEdit] = useState(false);
  const [, invalidateCache] = useInsertCacheInvalidationMutation();
  const { user, fetching } = useUser();
  const { connected } = useWeb3();

  const [fakeData, setFakeData] = useState([
    [],
    [
      BOX_TYPE.PLAYER_SKILLS,
      BOX_TYPE.PLAYER_COLOR_DISPOSITION,
      BOX_TYPE.PLAYER_TYPE,
    ],
    [
      // BOX_TYPE.PLAYER_ROLES,
      BOX_TYPE.PLAYER_GALLERY,
      BOX_TYPE.PLAYER_MEMBERSHIPS,
    ],
  ]);

  useEffect(() => {
    if (connected && !fetching && user?.id === player?.id) {
      setIsOwnProfile(true);
    }
  }, [user, fetching, connected, player?.id]);

  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (player) {
      invalidateCache({ playerId: player.id });
    }
  }, [player, invalidateCache]);

  if (router.isFallback) {
    return (
      <PageContainer>
        <LoadingState />
      </PageContainer>
    );
  }

  if (!player) {
    return <Error statusCode={404} />;
  }

  const addBox = (column: number, name: string) => {
    setBoxAvailableList(boxAvailableList.filter((box) => box !== name));
    const updatedFakeData = [...fakeData];
    updatedFakeData[column].push(name);
    setFakeData(updatedFakeData);
  };

  const removeBox = (column: number, name: string) => {
    setBoxAvailableList([...boxAvailableList, name]);
    const updatedFakeData = [...fakeData];
    updatedFakeData[column] = updatedFakeData[column].filter(
      (box) => box !== name,
    );
    setFakeData(updatedFakeData);
  };

  const getBox = (column: number, name: string): React.ReactNode => {
    const person = isOwnProfile ? user?.player : player;
    switch (name) {
      case BOX_TYPE.PLAYER_SKILLS:
        return (
          <PlayerSkills
            player={person}
            isOwnProfile={isOwnProfile}
            onRemoveClick={() => removeBox(column, name)}
          />
        );
      case BOX_TYPE.PLAYER_GALLERY:
        return (
          <PlayerGallery
            player={person}
            onRemoveClick={() => removeBox(column, name)}
          />
        );
      case BOX_TYPE.PLAYER_MEMBERSHIPS:
        return (
          <PlayerMemberships
            player={person}
            onRemoveClick={() => removeBox(column, name)}
          />
        );
      case BOX_TYPE.PLAYER_COLOR_DISPOSITION:
        return (
          <PlayerColorDisposition
            player={person}
            isOwnProfile={isOwnProfile}
            onRemoveClick={() => removeBox(column, name)}
          />
        );
      case BOX_TYPE.PLAYER_TYPE:
        return (
          <PlayerType
            player={person}
            isOwnProfile={isOwnProfile}
            onRemoveClick={() => removeBox(column, name)}
          />
        );
      case BOX_TYPE.PLAYER_ROLES:
        return (
          <PlayerRoles
            player={person}
            onRemoveClick={() => removeBox(column, name)}
          />
        );
      default:
      case BOX_TYPE.PLAYER_ACHIEVEMENTS:
        return (
          <PlayerAchievements onRemoveClick={() => removeBox(column, name)} />
        );
    }
  };

  return (
    <PageContainer p={0}>
      <Box
        background={`url(${getPlayerCoverImageFull(player)}) no-repeat`}
        bgSize="cover"
        bgPos="center"
        h={72}
        position="absolute"
        w="full"
      >
        {/* {isOwnProfile && (
          <Flex width="full" justifyContent="end">
            <IconButton
              variant="outline"
              aria-label="Edit Profile Info"
              size="lg"
              borderColor="pinkShadeOne"
              background="rgba(17, 17, 17, 0.9)"
              color="pinkShadeOne"
              _hover={{ color: 'white', borderColor: 'white' }}
              icon={<EditIcon />}
              isRound
              zIndex="docked"
              m={5}
              _focus={{
                boxShadow: 'none',
              }}
              _active={{
                transform: 'scale(0.8)',
                backgroundColor: 'transparent',
              }}
            />
          </Flex>
        )} */}
      </Box>
      <Flex
        w="full"
        minH="100vh"
        pl={[4, 8, 12]}
        pr={[4, 8, 12]}
        pb={[4, 8, 12]}
        pt={200 - 72}
        direction="column"
        align="center"
        zIndex={1}
      >
        <HeadComponent
          title={`Metagame profile for ${player.username}`}
          description={getPlayerDescription(player).replace('\n', ' ')}
          url={`https://my.metagame.wtf/player/${player.username}`}
          img={getPlayerImage(player)}
        />
        <Flex
          align="center"
          direction={{ base: 'column', md: 'row' }}
          alignItems="flex-start"
          maxWidth="7xl"
        >
          <Box
            width={{ base: '100%', md: '50%', lg: '33%' }}
            mr={{ base: 0, md: 4 }}
          >
            <Box mb="6">
              <PlayerHero {...{ player }} isOwnProfile={isOwnProfile} />
            </Box>
            {(fakeData || [[], [], []])[0].map((name) => (
              <Box mb="6" key={name}>
                {getBox(0, name)}
              </Box>
            ))}
            {canEdit ? (
              <PlayerAddSection
                boxList={boxAvailableList}
                setNewBox={(name) => addBox(0, name)}
                mb={6}
                display={{ base: 'none', md: 'flex' }}
              />
            ) : null}
          </Box>
          <Box
            width={{ base: '100%', md: '50%', lg: '66%' }}
            ml={{ base: 0, md: 4 }}
            mt={[0, 0, 100]}
            mb={[100, 100, 0]}
          >
            <Box width="100%">
              <Flex
                align="center"
                direction={{ base: 'column', lg: 'row' }}
                alignItems="flex-start"
              >
                <Box
                  width={{ base: '100%', lg: '50%' }}
                  mr={{ base: 0, lg: 4 }}
                >
                  {(fakeData || [[], [], []])[1].map((name) => (
                    <Box mb="6" key={name}>
                      {getBox(1, name)}
                    </Box>
                  ))}
                  {canEdit ? (
                    <PlayerAddSection
                      boxList={boxAvailableList}
                      setNewBox={(name) => addBox(1, name)}
                      mb={6}
                      display={{ base: 'none', lg: 'flex' }}
                    />
                  ) : null}
                </Box>
                <Box
                  width={{ base: '100%', lg: '50%' }}
                  ml={{ base: 0, lg: 4 }}
                >
                  {(fakeData || [[], [], []])[2].map((name) => (
                    <Box mb="6" key={name}>
                      {getBox(2, name)}
                    </Box>
                  ))}
                  {canEdit ? (
                    <PlayerAddSection
                      boxList={boxAvailableList}
                      setNewBox={(name) => addBox(2, name)}
                      mb={6}
                    />
                  ) : null}
                </Box>
              </Flex>
            </Box>
          </Box>
        </Flex>
      </Flex>
    </PageContainer>
  );
};

export default PlayerPage;

type QueryParams = { username: string };

export const getStaticPaths: GetStaticPaths<QueryParams> = async () => {
  const playerUsernames = await getTopPlayerUsernames();

  return {
    paths: playerUsernames.map((username) => ({
      params: { username },
    })),
    fallback: true,
  };
};

export const getStaticProps = async (
  context: GetStaticPropsContext<QueryParams>,
) => {
  const username = context.params?.username;
  if (username == null) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  let player = await getPlayer(username);
  if (player == null) {
    player = await getPlayer(username.toLowerCase());
    if (player != null) {
      return {
        redirect: {
          destination: `/player/${username.toLowerCase()}`,
          permanent: false,
        },
      };
    }
  }

  return {
    props: {
      player: player || null, // must be serializable
      key: username,
    },
    revalidate: 1,
  };
};
