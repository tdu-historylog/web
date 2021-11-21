import {userInfo} from '../utils/recoilAtoms';
import {useRecoilState, useSetRecoilState} from 'recoil';
import API from '../utils/api';
import {isCloud} from '../utils/recoilAtoms';
import {useToast} from '@chakra-ui/react';

const useGetUserInfo = () => {
  const [_userInfo, setUserInfo] = useRecoilState(userInfo);
  const setCloud = useSetRecoilState(isCloud);
  const toast = useToast();

  const getUserInfo = () => {
    const api = new API();

    api
      .getUserInfo(_userInfo.id, () => {
        setCloud(false);
        setUserInfo(null);
      })
      .then(info => {
        setUserInfo(info);

        return info;
      })
      .catch(() => {
        toast({
          title: 'ログアウトしました',
          status: 'info',
          isClosable: true,
        });
      });
  };

  const getUserInfoById = (id: string) => {
    const api = new API();

    api
      .getUserInfo(id, () => {
        setCloud(false);
        setUserInfo(null);
      })
      .then(info => {
        setUserInfo(info);

        return info;
      })
      .catch(() => {
        toast({
          title: 'ログアウトしました',
          status: 'info',
          isClosable: true,
        });
      });
  };

  return {getUserInfo: getUserInfo, getUserInfoById: getUserInfoById};
};

export default useGetUserInfo;
