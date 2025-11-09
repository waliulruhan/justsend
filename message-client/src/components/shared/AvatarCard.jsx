import { Avatar, AvatarGroup, Box, Stack } from '@mui/material';
import React from 'react';
import { transformImage } from '../../lib/features';

const AvatarCard = ({avatar = [] , isOnline} ) => {
    return (
        <Stack direction='row' alignItems={'center'} spacing={0.5}>
            <AvatarGroup
                sx={{
                position: "relative",
                }}
            >
                <Box width={"5rem"} height={"3rem"}>
                { avatar.slice(0, 4).map((i, index) => (
                    <Avatar
                    key={Math.random() * 100}
                    src={transformImage(i)}
                    alt={`Avatar ${index}`}
                    sx={{
                        width: "2rem",
                        height: "2rem",
                        position: "absolute",
                        border: isOnline ? '3px solid #94e843 !important' : 'none',
                        left: {
                            xs: `${0.5 + index}rem`,
                            sm: `${index}rem`,
                          },
                    }}
                    />
                ))}
                </Box>
            </AvatarGroup>
        </Stack>
    );
};

export default AvatarCard;