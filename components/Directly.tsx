/**!
 *
 * @author Yuto Watanabe
 *
 * Copyright (C) 2021 logcation
 */

import {
  Center,
  Button,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  Input,
  ModalFooter,
  useToast,
} from '@chakra-ui/react';
import {colors} from '../utils/colors';
import React from 'react';
import {useRecoilState, useRecoilValue} from 'recoil';
import {directText, savedLogState, isCloud} from '../utils/recoilAtoms';
import LogUtil from '../utils/LogUtil';
import {LogType, DBLog} from '../@types/log';
import {DB} from '../utils/db';
import useAddLog from '../hooks/useAddLog';

export const Direct = () => {
  const toast = useToast();
  const {isOpen, onOpen, onClose} = useDisclosure();

  const [text, setText] = useRecoilState(directText);
  const [, setSavedLog] = useRecoilState(savedLogState);

  const cloud = useRecoilValue(isCloud);
  const add = useAddLog();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const close = () => {
    onClose();
    setText('');
  };

  const save = async () => {
    const data = `jp.ac.dendai/${text}`;
    const logUtil = new LogUtil(data);

    const db: DB = new DB('log');
    await db.openDB();

    if (logUtil.validateQrData()) {
      const dbData: DBLog = {
        label: '',
        code: data,
        date: new Date(),
        type: LogType.normal,
        campus: logUtil.getLogCampus(),
      };

      await db.add(dbData);

      if (cloud) {
        add([dbData]);
      }

      onClose();
      setText('');
      setSavedLog(true);
    } else {
      toast({
        title: '座席コードが正しくありません',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Center>
      <Button
        backgroundColor={colors('buttonPrimary')}
        borderRadius="1.5rem"
        padding="2rem 3rem 2rem 3rem"
        width="20rem"
        onClick={onOpen}
      >
        <Text
          fontWeight="medium"
          fontSize="1.2rem"
          color={colors('textPrimary')}
        >
          座席コードを直接入力する
        </Text>
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={close}
        isCentered
        motionPreset="slideInBottom"
        size="sm"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={colors('textPrimary')} margin="1rem 0 .5rem 0">
            座席コードを直接入力する
          </ModalHeader>
          <ModalCloseButton size="lg" />
          <ModalBody pb={6}>
            <FormControl>
              <Input
                size="lg"
                value={text}
                onChange={handleChange}
                placeholder="座席コード"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              backgroundColor={colors('mainPrimary')}
              mr={3}
              onClick={save}
            >
              保存
            </Button>
            <Button
              color={colors('textPrimary')}
              variant="ghost"
              onClick={close}
            >
              キャンセル
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Center>
  );
};
