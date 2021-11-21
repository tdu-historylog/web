/**!
 * @author Yuto Watanabe
 *
 * Copyright (C) 2021 logcation
 */

import React from 'react';
import {
  Box,
  Flex,
  Text,
  AspectRatio,
  Center,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import {IoCameraSharp, IoVideocamOff, IoReloadOutline} from 'react-icons/io5';
import QrReader from './QrReader';
import {cameraStatusText} from '../utils/qrUtil';
import {useRecoilState, useRecoilValue} from 'recoil';
import {
  qrReadState,
  qrLoadState,
  useCameraState,
  cameraComponentState,
  qrDataState,
  savedLogState,
  isCloud,
} from '../utils/recoilAtoms';
import {LogType, DBLog} from '../@types/log';
import {colors} from '../utils/colors';
import LogUtil from '../utils/LogUtil';
import {DB} from '../utils/db';
import useAddLog from '../hooks/useAddLog';

const QrTitle = ({text}: {text: string}) => (
  <Flex>
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      margin="0 1rem 0 0"
    >
      <IoCameraSharp size="2rem" color={colors('mainSecondly')} />
    </Box>
    <Text fontWeight="bold" fontSize="1.3rem" color={colors('textPrimary')}>
      {text}
    </Text>
  </Flex>
);

/**
 * カメラのステータスを表示します
 * - ロード中: プログレス。ロード中かつカメラが使用可の場合
 * - カメラの使用拒否: アイコン
 *
 * @param isLoad ロード中の状態
 * @param isUseCamera カメラ使用可否状態
 * @param isQrRead 読み取り完了したか
 */
const qrStatus = (isLoad: boolean, isUseCamera: boolean, isQrRead: boolean) => {
  if (isLoad && isUseCamera) {
    return (
      <Spinner
        thickness="4px"
        size="xl"
        color={colors('mainSecondly')}
        position="absolute"
        zIndex="1"
      />
    );
  }
  if (!isUseCamera || isQrRead) {
    return (
      <button
        onClick={() => {
          location.reload();
        }}
      >
        {isQrRead ? (
          <IoReloadOutline size="3rem" color={colors('mainSecondly')} />
        ) : (
          <IoVideocamOff size="3rem" color={colors('mainSecondly')} />
        )}
      </button>
    );
  }

  return;
};

const Qr = () => {
  const toast = useToast();
  const [isQrRead] = useRecoilState(qrReadState);
  const [isQrLoad] = useRecoilState(qrLoadState);
  const [useCamera] = useRecoilState(useCameraState);
  const [qrData] = useRecoilState(qrDataState);
  const [, setSavedLog] = useRecoilState(savedLogState);
  const [cameraComponent, setCameraComponent] =
    useRecoilState(cameraComponentState);

  const cloud = useRecoilValue(isCloud);
  const add = useAddLog();

  React.useEffect(() => {
    setCameraComponent(true);
  }, []);

  React.useEffect(() => {
    const f = async () => {
      if (isQrRead || !useCamera) {
        setCameraComponent(false);
      }
      if (isQrRead) {
        const logUtil = new LogUtil(qrData);

        const db: DB = new DB('log');
        await db.openDB();

        if (logUtil.validateQrData()) {
          const dBData: DBLog = {
            label: '',
            code: qrData,
            date: new Date(),
            type: LogType.normal,
            campus: logUtil.getLogCampus(),
          };

          await db.add(dBData);

          if (cloud) {
            add([dBData]);
          }

          setSavedLog(true);
        } else {
          toast({
            title: 'QRコードが正しくありません',
            description: <Text wordBreak="break-all">{qrData}</Text>,
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
        }
      }
    };
    f();
  }, [isQrRead, useCamera]);

  return (
    <AspectRatio max="100px" ratio={1}>
      <Box
        width="100px"
        border={'solid 2px'}
        borderColor={colors('background')}
        backgroundColor={colors('background')}
        borderRadius="2rem"
        position="relative"
        zIndex="1"
      >
        {qrStatus(isQrLoad, useCamera, isQrRead)}
        <Box position="absolute" zIndex="0" borderRadius="2rem" width="100%">
          {cameraComponent ? <QrReader /> : null}
        </Box>
      </Box>
    </AspectRatio>
  );
};

/**
 * ステータステキストを表示
 */
const StatusText = () => {
  const [isQrLoad] = useRecoilState(qrLoadState);
  const [useCamera] = useRecoilState(useCameraState);
  const [isQrRead] = useRecoilState(qrReadState);
  return (
    <Box color={colors('textSecondly')}>
      {cameraStatusText(isQrLoad, isQrRead, useCamera)}
    </Box>
  );
};

const QrCode = () => {
  return (
    <React.Fragment>
      <Center>
        <Box
          backgroundColor={colors('mainPrimary')}
          margin="2rem 0 0 0"
          padding="1.5rem 1.5rem 0 1.5rem"
          borderRadius="1.5rem"
          width="20rem"
        >
          <Box color="white" margin="0 0 0 .2rem">
            <QrTitle text="QRコード読み取り" />
          </Box>
          <Box margin="1rem .2rem .2rem .2rem">
            <Qr />
          </Box>
          <Center padding=".8rem 0 .8rem 0">
            <StatusText />
          </Center>
        </Box>
      </Center>
      <Center margin="1rem 0 1rem 0">
        <Text fontWeight="bold" fontSize=".9rem" color={colors('textPrimary')}>
          または
        </Text>
      </Center>
    </React.Fragment>
  );
};

export default QrCode;
